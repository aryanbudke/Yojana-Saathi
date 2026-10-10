/**
 * Yojana Saathi email verification web app.
 * Only the FastAPI backend may call this endpoint; browsers never receive its secret.
 */
const OTP_TTL_SECONDS = 300;
const OTP_MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_OTP_EMAILS_PER_HOUR = 5;
const REQUEST_SKEW_SECONDS = 300;

function doPost(e) {
  try {
    const request = parseAndAuthorize_(e);
    let data;
    if (request.action === "send_otp") data = sendOtp_(request.payload);
    else if (request.action === "verify_otp") data = verifyOtp_(request.payload);
    else if (request.action === "send_result") data = sendResult_(request.payload);
    else throw publicError_("unknown_action", "Unsupported request action.");
    return json_({ ok: true, data: data });
  } catch (error) {
    const safe = error && error.publicCode
      ? error
      : publicError_("internal_error", "The email request could not be completed.");
    console.error("Email workflow failure: %s", safe.publicCode);
    return json_({
      ok: false,
      error: { code: safe.publicCode, message: safe.publicMessage },
    });
  }
}

function parseAndAuthorize_(e) {
  let request;
  try {
    request = JSON.parse(e.postData.contents);
  } catch (error) {
    throw publicError_("malformed_request", "The request body is invalid.");
  }
  if (!request || typeof request !== "object" || !request.payload) {
    throw publicError_("malformed_request", "The request body is invalid.");
  }
  const secret = requiredProperty_("SHARED_SECRET");
  const timestamp = Number(request.timestamp);
  const nonce = String(request.nonce || "");
  const action = String(request.action || "");
  const signature = String(request.signature || "");
  if (!Number.isInteger(timestamp) || Math.abs(Date.now() / 1000 - timestamp) > REQUEST_SKEW_SECONDS) {
    throw publicError_("unauthorized", "Request authorization failed.");
  }
  if (!/^[a-f0-9]{32}$/.test(nonce) || !/^[a-f0-9]{64}$/.test(signature)) {
    throw publicError_("unauthorized", "Request authorization failed.");
  }
  const canonical = action + "." + timestamp + "." + nonce + "." + stableStringify_(request.payload);
  const expected = hmacHex_(secret, canonical);
  if (!constantTimeEqual_(expected, signature)) {
    throw publicError_("unauthorized", "Request authorization failed.");
  }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) throw publicError_("busy", "Please try again shortly.");
  try {
    const cache = CacheService.getScriptCache();
    const nonceKey = "nonce:" + nonce;
    if (cache.get(nonceKey)) throw publicError_("replay_detected", "Request authorization failed.");
    cache.put(nonceKey, "1", REQUEST_SKEW_SECONDS * 2);
  } finally {
    lock.releaseLock();
  }
  return { action: action, payload: request.payload };
}

function sendOtp_(payload) {
  requireFields_(payload, ["challenge_id", "email", "name", "otp", "expires_at_ms"]);
  const challengeId = String(payload.challenge_id);
  const email = normalizeEmail_(payload.email);
  const name = cleanText_(payload.name, 120);
  const otp = String(payload.otp);
  const expiresAt = Number(payload.expires_at_ms);
  if (!/^[a-f0-9]{32}$/.test(challengeId) || !/^\d{6}$/.test(otp)) {
    throw publicError_("malformed_request", "The verification request is invalid.");
  }
  const now = Date.now();
  if (!Number.isFinite(expiresAt) || expiresAt <= now || expiresAt > now + OTP_TTL_SECONDS * 1000 + 30000) {
    throw publicError_("malformed_request", "The verification expiry is invalid.");
  }
  const secret = requiredProperty_("SHARED_SECRET");
  const emailHash = hmacHex_(secret, "email." + email);
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw publicError_("busy", "Please try again shortly.");
  try {
    const cache = CacheService.getScriptCache();
    if (cache.get("cooldown:" + emailHash)) {
      throw publicError_("resend_cooldown", "Please wait before requesting another code.");
    }
    const hourlyKey = "hourly:" + emailHash;
    const hourlyCount = Number(cache.get(hourlyKey) || "0");
    if (hourlyCount >= MAX_OTP_EMAILS_PER_HOUR) {
      throw publicError_("rate_limited", "Too many codes were requested. Try again later.");
    }
    if (MailApp.getRemainingDailyQuota() < 1) {
      throw publicError_("delivery_unavailable", "Email delivery is temporarily unavailable.");
    }
    const properties = PropertiesService.getScriptProperties();
    pruneState_(properties, now);
    const prior = cache.get("active:" + emailHash);
    if (prior) properties.deleteProperty("challenge:" + prior);
    const record = {
      emailHash: emailHash,
      otpHash: hmacHex_(secret, "otp." + challengeId + "." + otp),
      expiresAt: expiresAt,
      createdAt: now,
      attempts: 0,
      used: false,
      verificationRequestId: null,
    };
    properties.setProperty("challenge:" + challengeId, JSON.stringify(record));
    try {
      MailApp.sendEmail({
        to: email,
        subject: "Your Yojana Saathi verification code",
        name: "Yojana Saathi",
        body: "Hello " + name + ",\n\nYour verification code is " + otp + ". It expires in 5 minutes.\n\nIf you did not request this code, ignore this email. Never share this code with anyone.",
        htmlBody: otpEmailHtml_(name, otp),
      });
    } catch (error) {
      properties.deleteProperty("challenge:" + challengeId);
      throw publicError_("delivery_failed", "The verification email could not be sent.");
    }
    cache.put("active:" + emailHash, challengeId, OTP_TTL_SECONDS);
    cache.put("cooldown:" + emailHash, "1", RESEND_COOLDOWN_SECONDS);
    cache.put(hourlyKey, String(hourlyCount + 1), 3600);
  } finally {
    lock.releaseLock();
  }
  return { sent: true, expires_in_seconds: OTP_TTL_SECONDS };
}

function verifyOtp_(payload) {
  requireFields_(payload, ["challenge_id", "verification_request_id", "otp"]);
  const challengeId = String(payload.challenge_id);
  const requestId = String(payload.verification_request_id);
  const otp = String(payload.otp);
  if (!/^[a-f0-9]{32}$/.test(challengeId) || !/^[a-f0-9]{32}$/.test(requestId) || !/^\d{6}$/.test(otp)) {
    throw publicError_("malformed_request", "The verification request is invalid.");
  }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw publicError_("busy", "Please try again shortly.");
  try {
    const properties = PropertiesService.getScriptProperties();
    const key = "challenge:" + challengeId;
    const raw = properties.getProperty(key);
    if (!raw) throw publicError_("otp_expired", "The code expired. Request a new code.");
    const record = JSON.parse(raw);
    if (Date.now() > Number(record.expiresAt)) {
      properties.deleteProperty(key);
      throw publicError_("otp_expired", "The code expired. Request a new code.");
    }
    const suppliedHash = hmacHex_(requiredProperty_("SHARED_SECRET"), "otp." + challengeId + "." + otp);
    if (record.used) {
      if (record.verificationRequestId === requestId && constantTimeEqual_(record.otpHash, suppliedHash)) {
        return { verified: true, idempotent_replay: true };
      }
      throw publicError_("otp_used", "This code was already used. Request a new code.");
    }
    if (Number(record.attempts) >= OTP_MAX_ATTEMPTS) {
      throw publicError_("too_many_attempts", "Too many incorrect attempts. Request a new code.");
    }
    if (!constantTimeEqual_(record.otpHash, suppliedHash)) {
      record.attempts = Number(record.attempts) + 1;
      properties.setProperty(key, JSON.stringify(record));
      if (record.attempts >= OTP_MAX_ATTEMPTS) {
        throw publicError_("too_many_attempts", "Too many incorrect attempts. Request a new code.");
      }
      throw publicError_("invalid_otp", "The code is incorrect. Check the email and try again.");
    }
    record.used = true;
    record.verificationRequestId = requestId;
    properties.setProperty(key, JSON.stringify(record));
    return { verified: true, idempotent_replay: false };
  } finally {
    lock.releaseLock();
  }
}

function sendResult_(payload) {
  requireFields_(payload, ["challenge_id", "decision_id", "email", "name", "scheme_id", "scheme_name", "status", "reason", "next_steps"]);
  const challengeId = String(payload.challenge_id);
  const decisionId = String(payload.decision_id);
  const email = normalizeEmail_(payload.email);
  const name = cleanText_(payload.name, 120);
  const schemeName = cleanText_(payload.scheme_name, 255);
  const status = String(payload.status);
  const reason = cleanText_(payload.reason, 2000);
  const nextSteps = Array.isArray(payload.next_steps)
    ? payload.next_steps.slice(0, 10).map(function (item) { return cleanText_(item, 1000); })
    : [];
  if (!/^[a-f0-9]{32}$/.test(challengeId) || !/^[a-f0-9]{64}$/.test(decisionId)) {
    throw publicError_("malformed_request", "The result notification is invalid.");
  }
  if (["eligible", "not_eligible", "needs_review"].indexOf(status) === -1) {
    throw publicError_("malformed_request", "The result status is invalid.");
  }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) throw publicError_("busy", "Please try again shortly.");
  try {
    const properties = PropertiesService.getScriptProperties();
    const sentKey = "sent:" + decisionId;
    if (properties.getProperty(sentKey)) return { sent: true, already_sent: true };
    const raw = properties.getProperty("challenge:" + challengeId);
    if (!raw) throw publicError_("otp_expired", "The verified request is no longer available.");
    const challenge = JSON.parse(raw);
    const emailHash = hmacHex_(requiredProperty_("SHARED_SECRET"), "email." + email);
    if (!challenge.used || !constantTimeEqual_(challenge.emailHash, emailHash)) {
      throw publicError_("unauthorized", "Result notification authorization failed.");
    }
    if (MailApp.getRemainingDailyQuota() < 1) {
      throw publicError_("delivery_unavailable", "Email delivery is temporarily unavailable.");
    }
    try {
      MailApp.sendEmail({
        to: email,
        subject: resultSubject_(status, schemeName),
        name: "Yojana Saathi",
        body: resultText_(name, schemeName, status, reason, nextSteps),
        htmlBody: resultHtml_(name, schemeName, status, reason, nextSteps),
      });
    } catch (error) {
      throw publicError_("delivery_failed", "The result email could not be sent.");
    }
    properties.setProperty(sentKey, new Date().toISOString());
    return { sent: true, already_sent: false };
  } finally {
    lock.releaseLock();
  }
}

function otpEmailHtml_(name, otp) {
  return '<div style="font-family:Arial,sans-serif;color:#073b3a;line-height:1.6"><h2>Yojana Saathi email verification</h2><p>Hello ' + escapeHtml_(name) + ',</p><p>Your verification code is:</p><p style="font-size:30px;font-weight:700;letter-spacing:8px">' + otp + '</p><p>This code expires in 5 minutes. Never share it with anyone.</p></div>';
}

function resultSubject_(status, schemeName) {
  const label = status === "eligible" ? "Eligibility check complete" : status === "not_eligible" ? "Eligibility check result" : "Eligibility review needed";
  return label + " — " + schemeName;
}

function resultText_(name, schemeName, status, reason, nextSteps) {
  const label = status === "eligible" ? "Eligible (preliminary)" : status === "not_eligible" ? "Not eligible" : "Needs review";
  return "Hello " + name + ",\n\nYour Yojana Saathi check for " + schemeName + " is: " + label + ".\n\n" + reason + "\n\nNext steps:\n- " + nextSteps.join("\n- ") + "\n\nThis is preliminary guidance. The responsible government authority makes the final decision.";
}

function resultHtml_(name, schemeName, status, reason, nextSteps) {
  const label = status === "eligible" ? "Eligible (preliminary)" : status === "not_eligible" ? "Not eligible" : "Needs review";
  const items = nextSteps.map(function (step) { return "<li>" + escapeHtml_(step) + "</li>"; }).join("");
  return '<div style="font-family:Arial,sans-serif;color:#073b3a;line-height:1.6"><h2>Yojana Saathi eligibility check</h2><p>Hello ' + escapeHtml_(name) + ',</p><p><strong>' + escapeHtml_(schemeName) + ': ' + escapeHtml_(label) + '</strong></p><p>' + escapeHtml_(reason) + '</p><h3>Next steps</h3><ul>' + items + '</ul><p style="font-size:13px;color:#526b69">This is preliminary guidance. The responsible government authority makes the final decision.</p></div>';
}

function normalizeEmail_(value) {
  const email = String(value || "").trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw publicError_("malformed_request", "The email address is invalid.");
  }
  return email;
}

function cleanText_(value, maxLength) {
  const text = String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  if (!text || text.length > maxLength) throw publicError_("malformed_request", "A text field is invalid.");
  return text;
}

function requireFields_(payload, fields) {
  if (!payload || typeof payload !== "object") throw publicError_("malformed_request", "The request payload is invalid.");
  fields.forEach(function (field) {
    if (payload[field] === undefined || payload[field] === null) throw publicError_("malformed_request", "The request payload is incomplete.");
  });
}

function pruneState_(properties, now) {
  const values = properties.getProperties();
  Object.keys(values).forEach(function (key) {
    if (key.indexOf("challenge:") === 0) {
      try {
        const challenge = JSON.parse(values[key]);
        if (Number(challenge.expiresAt) + 86400000 < now) properties.deleteProperty(key);
      } catch (error) {
        properties.deleteProperty(key);
      }
    } else if (key.indexOf("sent:") === 0) {
      const sentAt = Date.parse(values[key]);
      if (!Number.isFinite(sentAt) || sentAt + 30 * 86400000 < now) properties.deleteProperty(key);
    }
  });
}

function requiredProperty_(name) {
  const value = PropertiesService.getScriptProperties().getProperty(name);
  if (!value || value.length < 32) throw publicError_("configuration_error", "The email service is not configured.");
  return value;
}

function hmacHex_(secret, value) {
  return Utilities.computeHmacSha256Signature(value, secret)
    .map(function (byte) { const normalized = byte < 0 ? byte + 256 : byte; return ("0" + normalized.toString(16)).slice(-2); })
    .join("");
}

function constantTimeEqual_(left, right) {
  left = String(left || ""); right = String(right || "");
  let mismatch = left.length ^ right.length;
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i++) mismatch |= (left.charCodeAt(i % (left.length || 1)) || 0) ^ (right.charCodeAt(i % (right.length || 1)) || 0);
  return mismatch === 0;
}

function stableStringify_(value) {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map(stableStringify_).join(",") + "]";
  return "{" + Object.keys(value).sort().map(function (key) { return JSON.stringify(key) + ":" + stableStringify_(value[key]); }).join(",") + "}";
}

function escapeHtml_(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character];
  });
}

function publicError_(code, message) {
  const error = new Error(message);
  error.publicCode = code;
  error.publicMessage = message;
  return error;
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
