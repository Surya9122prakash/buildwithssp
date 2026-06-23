"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { clearUser } from "@/lib/redux/authSlice";
import { Clock, Loader2 } from "lucide-react";

const HEARTBEAT_INTERVAL = 30 * 1000; // 30 seconds

export function SessionTimeoutHandler() {
  const dispatch = useAppDispatch();
  const { user, settings } = useAppSelector((state) => state.auth);
  
  const [isWarningShown, setIsWarningShown] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [isExtending, setIsExtending] = useState(false);

  const lastActiveTimeRef = useRef<number>(Date.now());
  const lastHeartbeatTimeRef = useRef<number>(Date.now());

  // Dynamic timeouts from database config or standard defaults
  const idleTimeoutMs = (settings?.idleTimeout || 900) * 1000;
  const warningDurationMs = (settings?.warningDuration || 60) * 1000;

  // Track page activity
  useEffect(() => {
    if (!user) {
      setIsWarningShown(false);
      return;
    }

    const resetIdleTimer = () => {
      // If warning modal is shown, do not reset idle timer on simple mouse move
      if (isWarningShown) return;
      lastActiveTimeRef.current = Date.now();
    };

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart", "click"];
    events.forEach((event) => {
      window.addEventListener(event, resetIdleTimer, { passive: true });
    });

    // Reset reference times on initial load
    lastHeartbeatTimeRef.current = Date.now();
    lastActiveTimeRef.current = Date.now();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetIdleTimer);
      });
    };
  }, [user, isWarningShown]);

  // Main session check interval (runs every second)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      const now = Date.now();

      if (isWarningShown) {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleAutoLogout("inactivity");
            return 0;
          }
          return prev - 1;
        });
      } else {
        const timeSinceActive = now - lastActiveTimeRef.current;
        const warningThreshold = idleTimeoutMs - warningDurationMs;

        if (timeSinceActive >= warningThreshold) {
          setIsWarningShown(true);
          const remainingSeconds = Math.max(0, Math.ceil((idleTimeoutMs - timeSinceActive) / 1000));
          setCountdown(remainingSeconds || Math.floor(warningDurationMs / 1000));
        } else {
          // Send periodic heartbeat to keep server session alive if active
          const timeSinceHeartbeat = now - lastHeartbeatTimeRef.current;
          if (timeSinceHeartbeat >= HEARTBEAT_INTERVAL && lastActiveTimeRef.current > lastHeartbeatTimeRef.current) {
            sendHeartbeat();
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user, isWarningShown, idleTimeoutMs, warningDurationMs]);

  const sendHeartbeat = async () => {
    try {
      lastHeartbeatTimeRef.current = Date.now();
      const res = await fetch("/api/auth/session/touch", { method: "POST" });
      if (res.status === 401) {
        handleAutoLogout("inactivity");
      }
    } catch (err) {
      console.error("Failed to send heartbeat to server:", err);
    }
  };

  const handleExtendSession = async () => {
    setIsExtending(true);
    try {
      const res = await fetch("/api/auth/session/touch", { method: "POST" });
      if (res.ok) {
        lastActiveTimeRef.current = Date.now();
        lastHeartbeatTimeRef.current = Date.now();
        setIsWarningShown(false);
      } else {
        handleAutoLogout("inactivity");
      }
    } catch (err) {
      console.error("Failed to extend session:", err);
    } finally {
      setIsExtending(false);
    }
  };

  const handleManualLogout = async () => {
    setIsWarningShown(false);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request failed", err);
    }
    dispatch(clearUser());
  };

  const handleAutoLogout = async (reason: "inactivity" | "absolute_timeout") => {
    setIsWarningShown(false);
    localStorage.setItem("sessionExpiredReason", reason);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request failed", err);
    }
    dispatch(clearUser());
  };

  if (!isWarningShown) return null;

  // SVG Circular countdown math
  const warningSeconds = warningDurationMs / 1000;
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (countdown / warningSeconds) * circumference;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(3, 4, 8, 0.8)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem"
      }}
    >
      <div
        className="glass-panel animate-pop"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "2.5rem",
          borderRadius: "24px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.15)",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem"
        }}
      >
        <div style={{ position: "relative", width: "90px", height: "90px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Circular Countdown SVG */}
          <svg style={{ transform: "rotate(-90deg)", width: "90px", height: "90px", position: "absolute", top: 0, left: 0 }}>
            <circle
              cx="45"
              cy="45"
              r={radius}
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="45"
              cy="45"
              r={radius}
              stroke="var(--primary)"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          {/* Inner Icon or Time */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
            <span style={{ fontSize: "1.5rem", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{countdown}</span>
            <span style={{ fontSize: "0.65rem", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "1px", marginTop: "2px" }}>sec</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <h3 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <Clock className="text-gradient" size={24} style={{ animation: "pulse 2s infinite" }} />
            Session Expiring Soon
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.92rem", lineHeight: 1.5, margin: 0 }}>
            You have been inactive for a while. For your security, you will be logged out automatically.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", width: "100%", marginTop: "0.5rem" }}>
          <button
            onClick={handleExtendSession}
            disabled={isExtending}
            style={{
              width: "100%",
              padding: "0.9rem",
              background: "linear-gradient(135deg, var(--primary), var(--secondary))",
              border: "none",
              borderRadius: "12px",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.95rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 15px rgba(99, 102, 241, 0.2)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(99, 102, 241, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(99, 102, 241, 0.2)";
            }}
          >
            {isExtending ? <Loader2 className="spinning-loader" size={18} /> : "Extend Session"}
          </button>
          
          <button
            onClick={handleManualLogout}
            style={{
              width: "100%",
              padding: "0.9rem",
              background: "rgba(255, 255, 255, 0.03)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "12px",
              color: "var(--text-secondary)",
              fontWeight: 600,
              fontSize: "0.95rem",
              cursor: "pointer",
              transition: "background 0.2s, border-color 0.2s, color 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.08)";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.2)";
              e.currentTarget.style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            Log Out Now
          </button>
        </div>
      </div>
    </div>
  );
}
