"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, User, Mail, Lock, ArrowRight } from "lucide-react";
import { useAppDispatch } from "@/lib/redux/hooks";
import { setUser } from "@/lib/redux/authSlice";

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isMounted, setIsMounted] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const role = "client";
  
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="login-root" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="bg-canvas" />
        <div className="bg-grid" />
        <Loader2 className="spinning-loader" size={48} />
        <h2 className="text-glow" style={{ marginTop: "1.5rem", fontSize: "1.2rem", fontWeight: 700 }}>Loading Registration Portal...</h2>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Registration failed");
        setLoading(false);
      } else {
        // Dispatch user details to Redux
        dispatch(setUser(data));
        // Redirect to homepage dashboard
        router.push("/");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected server error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="login-root" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
      <div className="bg-canvas" />
      <div className="bg-grid" />

      <div className="login-card glass-panel animate-pop" style={{ maxWidth: "480px", width: "100%" }}>
        <div className="login-header" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <span className="navbar-logo text-gradient" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}>BUILDWITHSSP</span>
          <span className="dashboard-badge">Create Workspace Account</span>
        </div>

        <form onSubmit={handleSubmit} className="login-form" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {errorMsg && <div className="login-error-msg">{errorMsg}</div>}

          <div className="form-group">
            <label>Full Name / Company Name</label>
            <div className="input-icon-wrapper">
              <input
                type="text"
                placeholder="John Doe or Acme Corp"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="form-input"
                required
              />
              <User size={16} />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-icon-wrapper">
              <input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                required
              />
              <Mail size={16} />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-wrapper">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                required
              />
              <Lock size={16} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "0.5rem" }}>
            <label>Confirm Password</label>
            <div className="input-icon-wrapper">
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="form-input"
                required
              />
              <Lock size={16} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="submit-brief-btn" style={{ width: "100%", padding: "0.9rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            {loading ? (
              <Loader2 className="spinning-loader" size={18} />
            ) : (
              <>
                Register Account <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Already have an account?{" "}
          <a href="/" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
