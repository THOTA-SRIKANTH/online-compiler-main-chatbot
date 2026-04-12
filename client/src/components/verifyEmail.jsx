import React, { useEffect, useState, useContext, useRef, useCallback } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import AppContext from "../context/Context";

// ─── Animated SVG countdown ring ─────────────────────────────────────────────
const CountdownRing = ({ timer, maxTime = 300 }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const progress = timer / maxTime;
  const strokeDashoffset = circumference * (1 - progress);
  const hue = Math.round(progress * 120);
  const color = `hsl(${hue}, 72%, 42%)`;
  return (
    <svg width="72" height="72" style={{ transform: "rotate(-90deg)", display: "block" }}>
      <circle cx="36" cy="36" r={radius} fill="none" stroke="#1e2433" strokeWidth="5" />
      <circle cx="36" cy="36" r={radius} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s linear, stroke 1s linear" }} />
    </svg>
  );
};

// ─── Single digit display box ─────────────────────────────────────────────────
const OtpBox = ({ value, focused, shake }) => {
  const filled = !!value;
  return (
    <div style={{
      width: 48, height: 58, borderRadius: 10,
      border: `2px solid ${focused ? "#34d399" : filled ? "#34d399" : "#2d3748"}`,
      background: filled ? "rgba(52,211,153,0.08)" : focused ? "rgba(52,211,153,0.04)" : "#111827",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 26, fontFamily: "'JetBrains Mono','Fira Code',monospace",
      fontWeight: 700, color: filled ? "#6ee7b7" : "#9ca3af",
      boxShadow: focused ? "0 0 0 3px rgba(52,211,153,0.2)" : "none",
      transition: "all 0.15s ease",
      animation: shake ? "shake 0.35s ease" : "none",
      userSelect: "none", flexShrink: 0,
    }}>
      {focused && !value
        ? <span style={{
            display: "inline-block", width: 2, height: 28,
            background: "#34d399", borderRadius: 1,
            animation: "blink 1s step-end infinite",
          }} />
        : value}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const VerifyEmail = () => {
  const navigate = useNavigate();
  const { apiUrl, setAlertMessage, setAlertType, setOpen } = useContext(AppContext);

  const query = new URLSearchParams(useLocation().search);
  const emailFromUrl = query.get("email");
  const [email] = useState(
    () => emailFromUrl || localStorage.getItem("verificationEmail") || ""
  );

  // ── ONE string holds all 6 digits — the core of the fix ───────────────────
  const [otpValue, setOtpValue] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const [timer, setTimer] = useState(300);
  const [canResend, setCanResend] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [verified, setVerified] = useState(false);
  const [shake, setShake] = useState(false);

  // Single hidden input ref — replaces the 6-input approach entirely
  const hiddenInputRef = useRef(null);

  // ── Store email, clean URL ─────────────────────────────────────────────────
  useEffect(() => {
    if (emailFromUrl) {
      localStorage.setItem("verificationEmail", emailFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [emailFromUrl]);

  // ── Auto-focus on mount ────────────────────────────────────────────────────
  useEffect(() => {
    if (email) setTimeout(() => hiddenInputRef.current?.focus(), 100);
  }, [email]);

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (timer <= 0) { setCanResend(true); return; }
    setCanResend(false);
    const id = setInterval(() => setTimer(t => Math.max(t - 1, 0)), 1000);
    return () => clearInterval(id);
  }, [timer]);

  const formatTime = () => {
    const m = Math.floor(timer / 60), s = timer % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // ── THE FIX: onChange on one input, no focus juggling ─────────────────────
  const handleHiddenChange = useCallback((e) => {
    const clean = e.target.value.replace(/[^0-9]/g, "").slice(0, 6);
    setOtpValue(clean);
    if (clean.length === 6) handleVerifyValue(clean);
  }, []);

  const handleHiddenKeyDown = useCallback((e) => {
    if (e.key === "Enter" && otpValue.length === 6) handleVerifyValue(otpValue);
  }, [otpValue]);

  // ── Verify ─────────────────────────────────────────────────────────────────
  const handleVerifyValue = async (value = otpValue) => {
    if (value.length !== 6 || verifying) return;
    setVerifying(true);
    try {
      await axios.post(`${apiUrl}/api/user/verify-email`, { email, otp: value });
      setVerified(true);
      setAlertType("success");
      setAlertMessage("Email verified! Welcome aboard 🎉");
      setOpen(true);
      localStorage.removeItem("verificationEmail");
      setTimeout(() => navigate("/login"), 1800);
    } catch (error) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setOtpValue("");
      setTimeout(() => hiddenInputRef.current?.focus(), 50);
      setAlertType("error");
      setAlertMessage(error.response?.data?.message || "Invalid OTP. Try again.");
      setOpen(true);
    } finally {
      setVerifying(false);
    }
  };

  // ── Resend ─────────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!canResend || resending) return;
    setResending(true);
    try {
      const res = await axios.post(`${apiUrl}/api/user/resend-otp`, { email });
      setTimer(res.data.expiresIn || 300);
      setCanResend(false);
      setOtpValue("");
      setAlertType("success");
      setAlertMessage("New OTP sent to your email!");
      setOpen(true);
      setTimeout(() => hiddenInputRef.current?.focus(), 50);
    } catch (error) {
      const expires = error.response?.data?.expiresIn;
      if (expires) { setTimer(expires); setCanResend(false); }
      setAlertType("warning");
      setAlertMessage(error.response?.data?.message || "Please wait before retrying.");
      setOpen(true);
    } finally {
      setResending(false);
    }
  };

  // Cursor sits at the index equal to digits typed, capped at 5
  const focusedIdx = Math.min(otpValue.length, 5);

  // ── No email ───────────────────────────────────────────────────────────────
  if (!email) {
    return (
      <div style={S.page}>
        <style>{css}</style>
        <div style={{ ...S.card, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠</div>
          <h2 style={{ ...S.title, color: "#f87171" }}>Session Expired</h2>
          <p style={S.subtitle}>Email not found. Please sign up again.</p>
          <button onClick={() => navigate("/register")} style={S.btnPrimary}>Back to Sign Up</button>
        </div>
      </div>
    );
  }

  // ── Verified ───────────────────────────────────────────────────────────────
  if (verified) {
    return (
      <div style={S.page}>
        <style>{css}</style>
        <div style={{ ...S.card, textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16, animation: "scaleIn 0.3s ease" }}>
            <svg width="64" height="64" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="30" fill="none" stroke="#34d399" strokeWidth="3" />
              <path d="M20 32 L29 41 L44 24" stroke="#34d399" strokeWidth="3.5" fill="none"
                strokeLinecap="round" strokeLinejoin="round"
                style={{ animation: "drawCheck 0.4s ease forwards 0.1s", strokeDasharray: 40, strokeDashoffset: 40 }} />
            </svg>
          </div>
          <h2 style={{ ...S.title, color: "#34d399" }}>Verified!</h2>
          <p style={S.subtitle}>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // ── Main ───────────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <style>{css}</style>
      <div style={S.bgGrid} />

      <div style={S.card}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#6ee7b7" opacity="0.15" />
            <path d="M8 14 L12 18 L20 10" stroke="#6ee7b7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 700, color: "#6ee7b7", letterSpacing: "0.05em" }}>
            CodeMeet
          </span>
        </div>

        <h1 style={S.title}>Verify your email</h1>
        <p style={S.subtitle}>
          We sent a 6-digit code to{" "}
          <span style={{ color: "#a5b4fc", fontWeight: 600, fontFamily: "'JetBrains Mono',monospace", fontSize: 13 }}>
            {email}
          </span>
        </p>

        {/*
          ── OTP INPUT AREA ───────────────────────────────────────────────────
          Clicking anywhere in this div focuses the single hidden input.
          The 6 <OtpBox> components are PURELY visual — they display otpValue[i].
          All typing goes into hiddenInputRef, which holds the full "123456" string.
          No focus juggling between 6 inputs = no more stopping at digit 3.
        */}
        <div
          style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12, position: "relative", cursor: "text" }}
          onClick={() => hiddenInputRef.current?.focus()}
        >
          {Array.from({ length: 6 }, (_, i) => (
            <OtpBox
              key={i}
              value={otpValue[i] || ""}
              focused={inputFocused && focusedIdx === i && otpValue.length < 6}
              shake={shake}
            />
          ))}

          <input
            ref={hiddenInputRef}
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otpValue}
            onChange={handleHiddenChange}
            onKeyDown={handleHiddenKeyDown}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            autoComplete="one-time-code"
            style={{
              position: "absolute", opacity: 0,
              width: 1, height: 1, top: 0, left: 0,
              pointerEvents: "none", fontSize: 1,
            }}
          />
        </div>

        {otpValue.length < 6 && (
          <p style={{ textAlign: "center", fontSize: 12, color: "#4b5563", marginBottom: 24 }}>
            <kbd style={{ background: "#1f2937", border: "1px solid #374151", borderRadius: 4, padding: "1px 5px", fontSize: 11, fontFamily: "monospace", color: "#9ca3af" }}>
              Ctrl+V
            </kbd>{" "}
            to paste your OTP
          </p>
        )}

        {/* Verify */}
        <button
          onClick={() => handleVerifyValue()}
          disabled={otpValue.length !== 6 || verifying}
          style={{
            ...S.btnPrimary,
            opacity: otpValue.length !== 6 ? 0.45 : 1,
            cursor: otpValue.length !== 6 ? "not-allowed" : "pointer",
          }}
        >
          {verifying
            ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" style={{ animation: "spin 0.8s linear infinite" }}>
                  <circle cx="9" cy="9" r="7" fill="none" stroke="#064e3b" strokeWidth="2.5" strokeDasharray="22" strokeDashoffset="10" />
                </svg>
                Verifying...
              </span>
            : "Verify Email →"
          }
        </button>

        {/* Timer */}
        <div style={S.timerSection}>
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <CountdownRing timer={timer} maxTime={300} />
            <div style={{ position: "absolute" }}>
              <span style={{
                fontSize: 13, fontFamily: "'JetBrains Mono',monospace", fontWeight: 700,
                color: timer <= 60 ? "#f87171" : timer <= 120 ? "#fbbf24" : "#6ee7b7",
              }}>
                {formatTime()}
              </span>
            </div>
          </div>
          <div style={{ flex: 1 }}>
            {timer > 0
              ? <><p style={S.timerLabel}>OTP expires in</p><p style={S.timerSub}>Check your spam folder if not found</p></>
              : <><p style={{ ...S.timerLabel, color: "#f87171" }}>OTP expired</p><p style={S.timerSub}>Request a new one below</p></>
            }
          </div>
        </div>

        {/* Resend */}
        <button
          onClick={handleResend}
          disabled={!canResend || resending}
          style={{
            ...S.btnSecondary,
            opacity: !canResend ? 0.4 : 1,
            cursor: !canResend ? "not-allowed" : "pointer",
            borderColor: canResend ? "#34d399" : "#2d3748",
            color: canResend ? "#34d399" : "#6b7280",
          }}
        >
          {resending ? "Sending..." : canResend ? "↺ Resend OTP" : `Resend available in ${formatTime()}`}
        </button>

        <p style={{ textAlign: "center", fontSize: 13, color: "#4b5563", margin: 0 }}>
          Wrong email?{" "}
          <span onClick={() => navigate("/register")} style={{ color: "#818cf8", cursor: "pointer", textDecoration: "underline" }}>
            Go back to signup
          </span>
        </p>
      </div>
    </div>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh", background: "#0d1117",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 20, position: "relative", overflow: "hidden",
  },
  bgGrid: {
    position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
    backgroundImage: `linear-gradient(rgba(110,231,183,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(110,231,183,0.03) 1px,transparent 1px)`,
    backgroundSize: "40px 40px",
  },
  card: {
    position: "relative", zIndex: 1,
    background: "rgba(17,24,39,0.97)", border: "1px solid #1f2937",
    borderRadius: 20, padding: "40px 36px", width: "100%", maxWidth: 420,
    boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
    animation: "fadeUp 0.4s ease",
  },
  title: {
    fontSize: 24, fontWeight: 800, color: "#f9fafb",
    margin: "0 0 8px", fontFamily: "'JetBrains Mono','Fira Code',monospace",
    letterSpacing: "-0.02em",
  },
  subtitle: { fontSize: 14, color: "#6b7280", margin: "0 0 28px", lineHeight: 1.5 },
  btnPrimary: {
    width: "100%", padding: "14px 0",
    background: "linear-gradient(135deg,#6ee7b7,#34d399)",
    border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700,
    color: "#064e3b", letterSpacing: "0.01em",
    fontFamily: "'JetBrains Mono',monospace", marginBottom: 20,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    transition: "opacity 0.15s ease",
  },
  timerSection: {
    display: "flex", alignItems: "center", gap: 16,
    background: "#111827", border: "1px solid #1f2937",
    borderRadius: 12, padding: "16px 20px", marginBottom: 12,
  },
  timerLabel: { fontSize: 13, fontWeight: 600, color: "#d1d5db", margin: "0 0 2px" },
  timerSub: { fontSize: 11, color: "#4b5563", margin: 0 },
  btnSecondary: {
    width: "100%", padding: "12px 0", background: "transparent",
    border: "1.5px solid", borderRadius: 12, fontSize: 14, fontWeight: 600,
    fontFamily: "'JetBrains Mono',monospace",
    transition: "all 0.2s ease", marginBottom: 20,
  },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700;800&display=swap');
  @keyframes fadeUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shake    { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
  @keyframes spin     { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes scaleIn  { from{transform:scale(0.7);opacity:0} to{transform:scale(1);opacity:1} }
  @keyframes drawCheck{ to{stroke-dashoffset:0} }
  @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0} }
`;

export default VerifyEmail;