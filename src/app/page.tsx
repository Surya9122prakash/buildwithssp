"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setUser, clearUser, updateClientSettings, updateUserProfile } from "@/lib/redux/authSlice";
import {
  Layers,
  MessageSquare,
  FileCheck,
  CreditCard,
  Calendar,
  Send,
  PlusCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Briefcase,
  ChevronRight,
  User,
  ArrowRight,
  ShieldAlert,
  Loader2,
  PhoneCall,
  Sparkles,
  ExternalLink,
  Download,
  Edit,
  Paperclip,
  Smile,
  Settings,
  X
} from "lucide-react";

// Types
interface Deliverable {
  id: string;
  name: string;
  phase: string;
  status: "pending" | "approved" | "revision";
  feedback?: string;
  link?: string;
}

interface Invoice {
  id: string;
  title: string;
  amount: number;
  status: "paid" | "pending" | "locked";
  dueDate: string;
}

interface Meeting {
  id: string;
  clientName: string;
  date: string;
  time: string;
  topic: string;
  duration: string;
  projectId: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: "On Track" | "In Review" | "Pending Client" | "Delayed";
  progress: number;
  phase: "Discovery" | "Design" | "Development" | "Testing" | "Launch";
  clientId?: string | null;
  deliverables: Deliverable[];
  invoices: Invoice[];
  meetings: Meeting[];
}

interface Message {
  id: string;
  sender: "owner" | "client" | "system";
  projectId: string;
  text: string;
  time: string;
  fileUrl?: string | null;
  fileName?: string | null;
  edited?: boolean | null;
  reactions?: string | null;
}

interface Brief {
  id: string;
  clientName: string;
  projectName: string;
  budget: number;
  description: string;
  status: "pending" | "approved" | "declined";
  clientId?: string | null;
}

interface ClientProfile {
  id: string;
  name: string;
  email: string;
  mobile?: string | null;
}

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const { user, loading: authLoading } = useAppSelector((state) => state.auth);
  const userRole = user?.role || null;

  // Authentication & Mounting State
  const [isMounted, setIsMounted] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState("");
  const [logoutNotice, setLogoutNotice] = useState("");

  // Navigation tab
  const [activeTab, setActiveTab] = useState<"projects" | "chat" | "billing" | "calendar" | "new-brief" | "brief-inbox" | "settings" | "profile">("projects");

  // Security settings states
  const clientSettings = useAppSelector((state) => state.auth.settings);
  const [settingsIdleTimeout, setSettingsIdleTimeout] = useState(15); // in minutes
  const [settingsWarningDuration, setSettingsWarningDuration] = useState(60); // in seconds
  const [settingsAbsoluteTimeout, setSettingsAbsoluteTimeout] = useState(24); // in hours
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);
  const [saveSettingsLoading, setSaveSettingsLoading] = useState(false);

  // Profile settings form states
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileMobile, setProfileMobile] = useState("");
  const [profileGender, setProfileGender] = useState("");
  const [profileDob, setProfileDob] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileCurrentPassword, setProfileCurrentPassword] = useState("");
  const [profileNewPassword, setProfileNewPassword] = useState("");
  const [profileConfirmPassword, setProfileConfirmPassword] = useState("");
  const [saveProfileSuccess, setSaveProfileSuccess] = useState(false);
  const [saveProfileError, setSaveProfileError] = useState("");
  const [saveProfileLoading, setSaveProfileLoading] = useState(false);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);

  useEffect(() => {
    if (clientSettings) {
      setSettingsIdleTimeout(Math.round(clientSettings.idleTimeout / 60));
      setSettingsWarningDuration(clientSettings.warningDuration);
      setSettingsAbsoluteTimeout(Math.round(clientSettings.absoluteTimeout / 3600));
    }
  }, [clientSettings]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfileEmail(user.email || "");
      setProfileMobile(user.mobile || "");
      setProfileGender(user.gender || "");
      setProfileDob(user.dob || "");
      setProfileImageUrl(user.profileImage || "");
      setProfileBio(user.bio || "");
    }
  }, [user]);

  // Core database-synced states
  const [projects, setProjects] = useState<Project[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [briefs, setBriefs] = useState<Brief[]>([]);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Chat features states
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [attachedFile, setAttachedFile] = useState<{ url: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

  const [activeProjectId, setActiveProjectId] = useState<string>("");
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0] || {
    id: "none",
    name: "No Project Assigned",
    description: "No active projects available in the database.",
    status: "On Track" as const,
    progress: 0,
    phase: "Discovery" as const,
    deliverables: [],
    invoices: [],
    meetings: []
  };

  // Billing Modal State
  const [payingInvoice, setPayingInvoice] = useState<Invoice | null>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Deliverable Feedback Modal State
  const [revisionDeliverable, setRevisionDeliverable] = useState<Deliverable | null>(null);
  const [revisionFeedback, setRevisionFeedback] = useState("");

  // Scheduling State
  const [selectedDate, setSelectedDate] = useState<string>("2026-06-18");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [meetingTopic, setMeetingTopic] = useState("");

  // New Project Form State (Client perspective)
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [newProjectBudget, setNewProjectBudget] = useState("");
  const [newProjectSuccess, setNewProjectSuccess] = useState(false);

  // Owner Super Admin Form States
  const [adminDelName, setAdminDelName] = useState("");
  const [adminDelPhase, setAdminDelPhase] = useState("Discovery");
  const [adminInvTitle, setAdminInvTitle] = useState("");
  const [adminInvAmount, setAdminInvAmount] = useState("");

  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // 1. Initial mounting check
  useEffect(() => {
    setIsMounted(true);
    const reason = localStorage.getItem("sessionExpiredReason");
    if (reason === "inactivity") {
      setLogoutNotice("You have been logged out due to inactivity. Please sign in again.");
      localStorage.removeItem("sessionExpiredReason");
    } else if (reason === "absolute_timeout") {
      setLogoutNotice("Your session has expired. Please sign in again.");
      localStorage.removeItem("sessionExpiredReason");
    }
  }, []);



  const broadcastEvent = (type: string, projectId?: string) => {
    // No-op for Vercel deployment (WebSockets disabled)
  };

  // Save preference to server session
  const saveSessionPreference = async (updates: { activeTab?: string; activeProjectId?: string; selectedClientId?: string }) => {
    try {
      await fetch("/api/auth/session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error("Failed to sync session preference to server", err);
    }
  };

  // Fetch all projects & briefs from Database
  const fetchDashboardData = async (preferredProjectId?: string) => {
    try {
      const resProj = await fetch("/api/projects");
      if (resProj.ok) {
        const dataProj = await resProj.json();
        setProjects(dataProj);

        // Auto select project: prioritize preferredProjectId, then current state activeProjectId, then first project
        const currentActiveProjId = preferredProjectId || activeProjectId;
        const targetProjId = currentActiveProjId && dataProj.some((p: any) => p.id === currentActiveProjId)
          ? currentActiveProjId
          : (dataProj.length > 0 ? dataProj[0].id : "");

        setActiveProjectId(targetProjId);
      }

      const resBriefs = await fetch("/api/briefs");
      if (resBriefs.ok) {
        const dataBriefs = await resBriefs.json();
        setBriefs(dataBriefs);
      }
    } catch (err) {
      console.error("Failed to fetch database records", err);
    }
  };

  // Fetch registered clients for the owner
  const fetchClients = async (preferredClientId?: string, preferredProjectId?: string) => {
    try {
      const res = await fetch("/api/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data);

        const targetClientId = preferredClientId || selectedClientId || (data.length > 0 ? data[0].id : null);
        setSelectedClientId(targetClientId);

        // Only set active project ID from client's project if we don't have a preferred project ID or current activeProjectId
        const currentActiveProjId = preferredProjectId || activeProjectId;
        if (!currentActiveProjId && targetClientId) {
          const clientProj = projects.find(p => p.clientId === targetClientId);
          if (clientProj) {
            setActiveProjectId(clientProj.id);
          }
        }
      }
    } catch (err) {
      console.error("Failed to load clients list", err);
    }
  };

  // Fetch project specific chat messages
  const fetchProjectMessages = async (projId: string) => {
    if (!projId || projId === "none") return;
    try {
      const res = await fetch(`/api/projects/${projId}/chat`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to load chat logs", err);
    }
  };

  // 2. Verify session on mount and fetch data
  useEffect(() => {
    if (!isMounted) return;

    const checkSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const userData = await res.json();
          dispatch(setUser({ user: userData.user, settings: userData.settings }));

          const prefs = userData.preferences || {};
          if (prefs.activeTab) {
            setActiveTab(prefs.activeTab);
          }
          if (prefs.selectedClientId) {
            setSelectedClientId(prefs.selectedClientId);
          }

          // Once user session is loaded, fetch dashboard data and pass preferred project
          await fetchDashboardData(prefs.activeProjectId || undefined);

          if (userData.user.role === "owner") {
            await fetchClients(prefs.selectedClientId || undefined, prefs.activeProjectId || undefined);
          }
        } else {
          dispatch(clearUser());
        }
      } catch (err) {
        console.error("Session restoration failed", err);
        dispatch(clearUser());
      }
    };

    checkSession();
  }, [isMounted, dispatch]);

  // Fetch clients list when logged in as owner (refetches list e.g. when projects length changes)
  useEffect(() => {
    if (!isMounted || userRole !== "owner") return;
    fetchClients();
  }, [isMounted, userRole, projects.length]);

  // Sync activeTab changes to server session
  useEffect(() => {
    if (isMounted && user) {
      saveSessionPreference({ activeTab });
    }
  }, [activeTab, user, isMounted]);

  // Sync activeProjectId changes to server session
  useEffect(() => {
    if (isMounted && user && activeProjectId && activeProjectId !== "none") {
      saveSessionPreference({ activeProjectId });
    }
  }, [activeProjectId, user, isMounted]);

  // Sync selectedClientId changes to server session
  useEffect(() => {
    if (isMounted && user && selectedClientId) {
      saveSessionPreference({ selectedClientId });
    }
  }, [selectedClientId, user, isMounted]);

  // 3. Fetch messages when project selection changes
  useEffect(() => {
    if (!isMounted || !userRole || !activeProjectId || activeProjectId === "none") return;
    fetchProjectMessages(activeProjectId);
  }, [isMounted, userRole, activeProjectId]);

  // Polling fallback to keep chat synced (Vercel-compatible)
  useEffect(() => {
    if (!isMounted || !activeProjectId || activeProjectId === "none" || activeTab !== "chat") return;

    const interval = setInterval(() => {
      fetchProjectMessages(activeProjectId);
    }, 4000);

    return () => clearInterval(interval);
  }, [isMounted, activeProjectId, activeTab]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, activeTab]);

  const filteredMessages = messages.filter(m => m.projectId === activeProjectId);
  const activeMeetings = activeProject.meetings || [];

  // Handle Login Authentication
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setLogoutNotice("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });
      if (res.ok) {
        const userData = await res.json();
        dispatch(setUser({ user: userData.user, settings: userData.settings }));
        await fetchDashboardData();
        setActiveTab("projects");
      } else {
        const errData = await res.json();
        setLoginError(errData.error || "Login failed");
      }
    } catch (err) {
      setLoginError("Database server connection failed");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request failed", err);
    }
    dispatch(clearUser());
    setEmailInput("");
    setPasswordInput("");
    setLoginError("");
    setActiveTab("projects");
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSettingsLoading(true);
    setSaveSettingsSuccess(false);

    try {
      const res = await fetch("/api/auth/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idleTimeout: settingsIdleTimeout * 60,
          warningDuration: settingsWarningDuration,
          absoluteTimeout: settingsAbsoluteTimeout * 3600
        })
      });

      if (res.ok) {
        const updated = await res.json();
        dispatch(updateClientSettings(updated));
        setSaveSettingsSuccess(true);
        setTimeout(() => setSaveSettingsSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save session settings:", err);
    } finally {
      setSaveSettingsLoading(false);
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Restrict size: Max 2MB
    const MAX_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setSaveProfileError("Image size exceeds the 2MB limit.");
      return;
    }

    setUploadingProfileImage(true);
    setSaveProfileError("");

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          category: "profile"
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get presigned upload URL");
      }

      const { uploadUrl, fileUrl } = await res.json();

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (uploadRes.ok) {
        setProfileImageUrl(fileUrl);
      } else {
        setSaveProfileError("Upload to storage bucket failed");
      }
    } catch (err) {
      console.error("Profile image upload error:", err);
      setSaveProfileError("Profile image upload failed");
    } finally {
      setUploadingProfileImage(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveProfileLoading(true);
    setSaveProfileSuccess(false);
    setSaveProfileError("");

    if (profileNewPassword && profileNewPassword !== profileConfirmPassword) {
      setSaveProfileError("New passwords do not match");
      setSaveProfileLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName,
          email: profileEmail,
          mobile: profileMobile || null,
          gender: profileGender || null,
          dob: profileDob || null,
          profileImage: profileImageUrl || null,
          bio: profileBio || null,
          currentPassword: profileCurrentPassword || undefined,
          newPassword: profileNewPassword || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        dispatch(updateUserProfile(data.user));
        setSaveProfileSuccess(true);
        setProfileCurrentPassword("");
        setProfileNewPassword("");
        setProfileConfirmPassword("");
        setTimeout(() => setSaveProfileSuccess(false), 4000);
      } else {
        setSaveProfileError(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Save profile error:", err);
      setSaveProfileError("Network or server connection failed");
    } finally {
      setSaveProfileLoading(false);
    }
  };

  // Handle Deliverable Approval (Client)
  const handleApproveDeliverable = async (deliverableId: string) => {
    if (activeProjectId === "none") return;
    try {
      const res = await fetch(`/api/projects/${activeProjectId}/deliverables`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deliverableId, status: "approved" })
      });

      if (res.ok) {
        // Re-calculate completion progress
        const updatedDels = activeProject.deliverables.map(d =>
          d.id === deliverableId ? { ...d, status: "approved" as const } : d
        );
        const approvedCount = updatedDels.filter(d => d.status === "approved").length;
        const newProgress = Math.min(100, Math.round((approvedCount / updatedDels.length) * 100));

        let newPhase = activeProject.phase;
        if (approvedCount >= updatedDels.length - 1 && approvedCount > 0) newPhase = "Testing" as const;
        if (approvedCount === updatedDels.length && approvedCount > 0) newPhase = "Launch" as const;
        const newStatus = approvedCount === updatedDels.length ? "On Track" : "In Review";

        // Update Project in DB
        await fetch(`/api/projects/${activeProjectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ progress: newProgress, phase: newPhase, status: newStatus })
        });

        // Add System message log
        const approvedDel = activeProject.deliverables.find(d => d.id === deliverableId);
        await fetch(`/api/projects/${activeProjectId}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: "system",
            text: `✓ Deliverable Approved: "${approvedDel?.name}" signed off by Client. Project progress increased to ${newProgress}%.`
          })
        });

        await fetchDashboardData();
        await fetchProjectMessages(activeProjectId);
        broadcastEvent("PROJECT_UPDATE", activeProjectId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Revision Request (Client)
  const handleOpenRevisionModal = (del: Deliverable) => {
    setRevisionDeliverable(del);
    setRevisionFeedback("");
  };

  const handleSubmitRevision = async () => {
    if (!revisionDeliverable || activeProjectId === "none") return;

    try {
      const res = await fetch(`/api/projects/${activeProjectId}/deliverables`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: revisionDeliverable.id, status: "revision", feedback: revisionFeedback })
      });

      if (res.ok) {
        // Update Project status to Pending Client
        await fetch(`/api/projects/${activeProjectId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Pending Client" })
        });

        // Add client message
        await fetch(`/api/projects/${activeProjectId}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: "client",
            text: `⚠️ Revision requested on "${revisionDeliverable.name}": "${revisionFeedback}"`
          })
        });

        setRevisionDeliverable(null);
        await fetchDashboardData();
        await fetchProjectMessages(activeProjectId);
        broadcastEvent("PROJECT_UPDATE", activeProjectId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Invoice Payment (Client)
  const handleOpenPaymentModal = (invoice: Invoice) => {
    setPayingInvoice(invoice);
    setPaymentSuccess(false);
    setPaymentLoading(false);
    setCardNumber("");
    setCardExpiry("");
    setCardCVC("");
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoice || activeProjectId === "none") return;
    setPaymentLoading(true);

    try {
      // Simulate transaction validation delay
      await new Promise(r => setTimeout(r, 1500));

      const res = await fetch(`/api/projects/${activeProjectId}/invoices`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: payingInvoice.id, status: "paid" })
      });

      if (res.ok) {
        // Unlock next milestone invoice if applicable
        const nextLockedInvoice = activeProject.invoices.find(i => i.status === "locked");
        if (nextLockedInvoice && payingInvoice.status === "pending") {
          await fetch(`/api/projects/${activeProjectId}/invoices`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: nextLockedInvoice.id, status: "pending" })
          });
        }

        // Add System chat notice
        await fetch(`/api/projects/${activeProjectId}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: "system",
            text: `💳 Milestone Payment Confirmed: $${payingInvoice.amount.toLocaleString()} received for "${payingInvoice.title}".`
          })
        });

        setPaymentLoading(false);
        setPaymentSuccess(true);
        await fetchDashboardData();
        await fetchProjectMessages(activeProjectId);
        broadcastEvent("PROJECT_UPDATE", activeProjectId);
      }
    } catch (err) {
      console.error(err);
      setPaymentLoading(false);
    }
  };

  // Handle Sending Chat Messages
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachedFile) || activeProjectId === "none") return;

    const msgText = inputText.trim();
    setInputText("");

    try {
      const res = await fetch(`/api/projects/${activeProjectId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: userRole || "client",
          text: msgText,
          fileUrl: attachedFile?.url || null,
          fileName: attachedFile?.name || null
        })
      });

      if (res.ok) {
        setAttachedFile(null);
        await fetchProjectMessages(activeProjectId);
        broadcastEvent("CHAT_UPDATE", activeProjectId);

        // Only clients trigger the simulated automated responder bot
        if (userRole === "client") {
          setIsTyping(true);
          setTimeout(async () => {
            setIsTyping(false);
            let replyText = "";
            const textLower = msgText.toLowerCase();

            if (textLower.includes("status") || textLower.includes("progress") || textLower.includes("stage")) {
              replyText = `The project "${activeProject.name}" is currently in the **${activeProject.phase}** phase, and is overall **${activeProject.progress}%** complete.`;
            } else if (textLower.includes("meeting") || textLower.includes("call") || textLower.includes("schedule")) {
              replyText = `Sure! I would love to connect. You can book a slot directly on the calendar widget in this dashboard, and it will sync to my calendar automatically.`;
            } else if (textLower.includes("invoice") || textLower.includes("payment") || textLower.includes("billing") || textLower.includes("cost")) {
              const pendingInvoice = activeProject.invoices.find(i => i.status === "pending");
              if (pendingInvoice) {
                replyText = `The current active invoice is "${pendingInvoice.title}" for $${pendingInvoice.amount.toLocaleString()}. You can complete the payment securely in the "Billing" tab of your dashboard.`;
              } else {
                replyText = `All invoices for completed milestones are paid up. Thank you! Let me know if you need any adjustments to subsequent phases.`;
              }
            } else if (textLower.includes("hello") || textLower.includes("hi") || textLower.includes("hey")) {
              replyText = `Hello! Hope you're having a great day. I'm actively coding. What can I help you with today?`;
            } else {
              replyText = `Thank you for the message! I've received it and will look into it. I'm currently working on finishing up the ${activeProject.phase} deliverables.`;
            }

            await fetch(`/api/projects/${activeProjectId}/chat`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                sender: "owner",
                text: replyText
              })
            });
            await fetchProjectMessages(activeProjectId);
            broadcastEvent("CHAT_UPDATE", activeProjectId);
          }, 1500);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeProjectId === "none") return;

    // Restrict size: Max 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert("File size exceeds the allowed limit of 5MB.");
      return;
    }

    setUploadingFile(true);

    try {
      // 1. Get presigned upload URL from server
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          category: "chat"
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to get presigned upload URL");
      }

      const { uploadUrl, fileUrl, fileName } = await res.json();

      // 2. Upload the file directly to Cloudflare R2 via PUT
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (uploadRes.ok) {
        setAttachedFile({ url: fileUrl, name: fileName });
      } else {
        console.error("Upload to R2 bucket failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleEditMessage = async (messageId: string, newText: string) => {
    if (!newText.trim() || activeProjectId === "none") return;
    try {
      const res = await fetch(`/api/projects/${activeProjectId}/chat`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          text: newText.trim(),
        })
      });
      if (res.ok) {
        setEditingMessageId(null);
        setEditingText("");
        await fetchProjectMessages(activeProjectId);
        broadcastEvent("CHAT_UPDATE", activeProjectId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    if (activeProjectId === "none" || !user) return;

    const targetMsg = messages.find(m => m.id === messageId);
    if (!targetMsg) return;

    let reactionsMap: Record<string, string[]> = {};
    if (targetMsg.reactions) {
      try {
        reactionsMap = JSON.parse(targetMsg.reactions);
      } catch (err) {
        reactionsMap = {};
      }
    }

    const currentUsers = reactionsMap[emoji] || [];
    const userId = user.email;
    let newUsers: string[];

    if (currentUsers.includes(userId)) {
      newUsers = currentUsers.filter(id => id !== userId);
    } else {
      newUsers = [...currentUsers, userId];
    }

    if (newUsers.length === 0) {
      delete reactionsMap[emoji];
    } else {
      reactionsMap[emoji] = newUsers;
    }

    try {
      const res = await fetch(`/api/projects/${activeProjectId}/chat`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          reactions: JSON.stringify(reactionsMap),
        })
      });
      if (res.ok) {
        await fetchProjectMessages(activeProjectId);
        broadcastEvent("CHAT_UPDATE", activeProjectId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Call Scheduling (Client)
  const handleScheduleCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTime || activeProjectId === "none") return;

    try {
      const res = await fetch(`/api/projects/${activeProjectId}/meetings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: userRole === "owner" ? "Owner Sync" : (user?.name || "Acme Corp"),
          date: selectedDate,
          time: selectedTime,
          topic: meetingTopic || "Project Progress Sync",
          duration: "30 mins"
        })
      });

      if (res.ok) {
        await fetch(`/api/projects/${activeProjectId}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: "system",
            text: `📅 Call Scheduled: "${meetingTopic || "Project Progress Sync"}" on ${selectedDate} at ${selectedTime}. Sync Link generated.`
          })
        });

        setSelectedTime("");
        setMeetingTopic("");
        await fetchDashboardData();
        await fetchProjectMessages(activeProjectId);
        broadcastEvent("PROJECT_UPDATE", activeProjectId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Client Submitting a New Project Brief
  const handleCreateNewProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const res = await fetch("/api/briefs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: user?.name || "Acme Corp",
          projectName: newProjectName.trim(),
          budget: Number(newProjectBudget) || 5000,
          description: newProjectDesc.trim(),
          clientId: user?.id || null
        })
      });

      if (res.ok) {
        if (activeProjectId !== "none") {
          await fetch(`/api/projects/${activeProjectId}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sender: "system",
              text: `📝 New Brief Submitted: "${newProjectName.trim()}". Surya has been notified and will review the specifications.`
            })
          });
        }

        setNewProjectName("");
        setNewProjectDesc("");
        setNewProjectBudget("");
        setNewProjectSuccess(true);

        setTimeout(() => {
          setNewProjectSuccess(false);
          setActiveTab("projects");
        }, 2000);

        await fetchDashboardData();
        broadcastEvent("PROJECT_UPDATE", activeProjectId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Super Admin Control Handlers (Owner)
  const handleUpdateProgress = async (progress: number) => {
    if (activeProjectId === "none") return;
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, progress } : p));
    try {
      await fetch(`/api/projects/${activeProjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress })
      });
      broadcastEvent("PROJECT_UPDATE", activeProjectId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePhase = async (phase: "Discovery" | "Design" | "Development" | "Testing" | "Launch") => {
    if (activeProjectId === "none") return;
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, phase } : p));
    try {
      await fetch(`/api/projects/${activeProjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phase })
      });
      broadcastEvent("PROJECT_UPDATE", activeProjectId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (status: "On Track" | "In Review" | "Pending Client" | "Delayed") => {
    if (activeProjectId === "none") return;
    setProjects(prev => prev.map(p => p.id === activeProjectId ? { ...p, status } : p));
    try {
      await fetch(`/api/projects/${activeProjectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      broadcastEvent("PROJECT_UPDATE", activeProjectId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminAddDeliverable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminDelName.trim() || activeProjectId === "none") return;

    try {
      const res = await fetch(`/api/projects/${activeProjectId}/deliverables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: adminDelName.trim(), phase: adminDelPhase })
      });

      if (res.ok) {
        await fetch(`/api/projects/${activeProjectId}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: "system",
            text: `🆕 New Deliverable Added: "${adminDelName.trim()}" under ${adminDelPhase} phase. Ready for client review.`
          })
        });

        setAdminDelName("");
        await fetchDashboardData();
        await fetchProjectMessages(activeProjectId);
        broadcastEvent("PROJECT_UPDATE", activeProjectId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminInvTitle.trim() || !adminInvAmount || activeProjectId === "none") return;

    try {
      const res = await fetch(`/api/projects/${activeProjectId}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: adminInvTitle.trim(), amount: Number(adminInvAmount) })
      });

      if (res.ok) {
        await fetch(`/api/projects/${activeProjectId}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: "system",
            text: `💵 Invoice Generated: "${adminInvTitle.trim()}" for $${Number(adminInvAmount).toLocaleString()}. Milestone payment requested.`
          })
        });

        setAdminInvTitle("");
        setAdminInvAmount("");
        await fetchDashboardData();
        await fetchProjectMessages(activeProjectId);
        broadcastEvent("PROJECT_UPDATE", activeProjectId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminMarkFixed = async (deliverableId: string) => {
    if (activeProjectId === "none") return;
    try {
      const res = await fetch(`/api/projects/${activeProjectId}/deliverables`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deliverableId, status: "pending", feedback: null })
      });

      if (res.ok) {
        const del = activeProject.deliverables.find(d => d.id === deliverableId);
        await fetch(`/api/projects/${activeProjectId}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: "owner",
            text: `🛠️ Resolve Note: I have resolved the issue and updated "${del?.name}". Ready for re-review!`
          })
        });

        await fetchDashboardData();
        await fetchProjectMessages(activeProjectId);
        broadcastEvent("PROJECT_UPDATE", activeProjectId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdminUnlockInvoice = async (invoiceId: string) => {
    if (activeProjectId === "none") return;
    try {
      const res = await fetch(`/api/projects/${activeProjectId}/invoices`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: invoiceId, status: "pending" })
      });
      if (res.ok) {
        await fetchDashboardData();
        broadcastEvent("PROJECT_UPDATE", activeProjectId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveBrief = async (brief: Brief) => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: brief.projectName,
          description: brief.description,
          status: "On Track",
          progress: 10,
          phase: "Discovery",
          clientId: brief.clientId || null,
          deliverables: [
            { name: "Discovery Scope & Requirements Spec", phase: "Discovery", status: "pending" }
          ],
          invoices: [
            { title: "Discovery Phase Kickoff Payment", amount: brief.budget * 0.1, status: "pending", dueDate: "Immediate" }
          ]
        })
      });

      if (res.ok) {
        const newProj = await res.json();

        await fetch("/api/briefs", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: brief.id, status: "approved" })
        });

        await fetch(`/api/projects/${newProj.id}/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sender: "system",
            text: `🚀 Project Initialized: "${brief.projectName}" approved by Surya S. Workspace is now active.`
          })
        });

        setActiveProjectId(newProj.id);
        await fetchDashboardData();
        broadcastEvent("PROJECT_UPDATE", newProj.id);
        setActiveTab("projects");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclineBrief = async (briefId: string) => {
    try {
      const res = await fetch("/api/briefs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: briefId, status: "declined" })
      });
      if (res.ok) {
        await fetchDashboardData();
        broadcastEvent("PROJECT_UPDATE");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Hydration safety loading view
  if (!isMounted || authLoading) {
    return (
      <div className="login-root" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="bg-canvas" />
        <div className="bg-grid" />
        <Loader2 className="spinning-loader" size={48} />
        <h2 className="text-glow" style={{ marginTop: "1.5rem", fontSize: "1.2rem", fontWeight: 700 }}>Initializing Workspace Hub...</h2>
      </div>
    );
  }

  // Render Login Portal if not authenticated
  if (!userRole) {
    return (
      <div className="login-root">
        <div className="bg-canvas" />
        <div className="bg-grid" />

        <div className="login-card glass-panel animate-pop">
          <div className="login-header" style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <span className="navbar-logo text-gradient" style={{ fontSize: "2rem", display: "block", marginBottom: "0.5rem" }}>BUILDWITHSSP</span>
            <span className="dashboard-badge">Workspace Access Portal</span>
          </div>

          <form onSubmit={handleLoginSubmit} className="login-form" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {logoutNotice && (
              <div
                className="login-success-msg animate-pop"
                style={{
                  background: "rgba(245, 158, 11, 0.12)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  color: "#f59e0b",
                  padding: "0.75rem",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem"
                }}
              >
                <AlertCircle size={16} />
                {logoutNotice}
              </div>
            )}
            {loginError && <div className="login-error-msg">{loginError}</div>}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="name@example.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: "0.5rem" }}>
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <button type="submit" className="submit-brief-btn" style={{ width: "100%", padding: "0.9rem" }}>
              Sign In to Workspace
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            Don't have an account?{" "}
            <a href="/register" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
              Sign Up
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Helper to render message bubble
  const renderMessageBubble = (msg: Message) => {
    const isSystem = msg.sender === "system";
    const isOwner = msg.sender === "owner";
    const isEditing = editingMessageId === msg.id;

    // Is the logged-in user the sender?
    const isSelf = (user?.role === "owner" && msg.sender === "owner") ||
      (user?.role === "client" && msg.sender === "client");

    // Parse reactions JSON
    let reactionsMap: Record<string, string[]> = {};
    if (msg.reactions) {
      try {
        reactionsMap = JSON.parse(msg.reactions);
      } catch (e) {
        reactionsMap = {};
      }
    }

    return (
      <div key={msg.id} className={`chat-bubble-wrapper ${isSelf ? "self" : "other"} ${msg.sender}`} style={{ position: "relative" }}>
        {!isSelf && !isSystem && (
          <div className="chat-avatar-circle">
            <Image
              src={msg.sender === "owner" ? "/images/profile.jfif" : "/images/client-placeholder.png"}
              alt={msg.sender === "owner" ? "Surya" : "User"}
              width={28}
              height={28}
              className="avatar-img"
              onError={(e) => {
                e.currentTarget.src = msg.sender === "owner"
                  ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=50&q=80"
                  : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=50&q=80";
              }}
            />
          </div>
        )}

        <div className="chat-bubble-content-container" style={{ position: "relative", display: "flex", flexDirection: "column", maxWidth: "70%" }}>
          <div className="chat-bubble-content" style={{ width: "100%", position: "relative" }}>
            {isSystem ? (
              <div className="system-msg">
                <Sparkles size={14} />
                <span>{msg.text}</span>
              </div>
            ) : isEditing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                <textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  className="chat-edit-textarea"
                  style={{
                    width: "100%",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "8px",
                    color: "#fff",
                    padding: "0.5rem",
                    fontSize: "0.9rem",
                    resize: "none"
                  }}
                  rows={2}
                />
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => {
                      setEditingMessageId(null);
                      setEditingText("");
                    }}
                    style={{
                      background: "rgba(255, 255, 255, 0.08)",
                      border: "none",
                      borderRadius: "4px",
                      color: "#ccc",
                      padding: "0.25rem 0.6rem",
                      fontSize: "0.8rem",
                      cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleEditMessage(msg.id, editingText)}
                    style={{
                      background: "var(--primary)",
                      border: "none",
                      borderRadius: "4px",
                      color: "#000",
                      padding: "0.25rem 0.6rem",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Regular text */}
                {msg.text && msg.text !== msg.fileName && msg.text !== "Sent an attachment" && (
                  <div className="bubble-text" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{msg.text}</div>
                )}

                {/* File Attachment Render */}
                {msg.fileUrl && (
                  <div className="msg-attachment-box" style={{ marginTop: "0.75rem" }}>
                    {/\.(png|jpe?g|gif|webp)$/i.test(msg.fileUrl) ? (
                      <div className="attachment-image-wrapper">
                        <img
                          src={msg.fileUrl}
                          alt={msg.fileName || "Image attachment"}
                          className="attachment-img-preview"
                          style={{
                            maxWidth: "100%",
                            maxHeight: "180px",
                            borderRadius: "8px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            cursor: "zoom-in"
                          }}
                          onClick={() => window.open(msg.fileUrl!, "_blank")}
                        />
                      </div>
                    ) : (
                      <a
                        href={msg.fileUrl}
                        download={msg.fileName || "attachment"}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.6rem 0.85rem",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          borderRadius: "8px",
                          color: "var(--primary)",
                          textDecoration: "none",
                          fontSize: "0.85rem",
                          fontWeight: 500,
                          transition: "background 0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"}
                      >
                        <FileText size={16} />
                        <span style={{ color: "#fff", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "150px", whiteSpace: "nowrap" }}>
                          {msg.fileName || "Download Attachment"}
                        </span>
                        <Download size={14} style={{ marginLeft: "auto" }} />
                      </a>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "0.25rem" }}>
                  <span className="bubble-time" style={{ margin: 0 }}>{msg.time}</span>
                  {msg.edited && (
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontStyle: "italic" }}>(edited)</span>
                  )}
                </div>

                {/* Self Edit Pencil Trigger */}
                {isSelf && !isSystem && (
                  <button
                    type="button"
                    className="msg-action-edit-btn"
                    onClick={() => {
                      setEditingMessageId(msg.id);
                      setEditingText(msg.text === msg.fileName || msg.text === "Sent an attachment" ? "" : msg.text);
                    }}
                    style={{
                      position: "absolute",
                      right: "-2rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "var(--text-muted)",
                      cursor: "pointer",
                      padding: "4px",
                      opacity: 0,
                      transition: "opacity 0.2s"
                    }}
                  >
                    <Edit size={14} />
                  </button>
                )}

                {/* Emoji reactions bar (hover reactions selector) */}
                {!isSystem && (
                  <div
                    className="msg-reactions-hover-bar"
                    style={{
                      position: "absolute",
                      left: isSelf ? "auto" : "-1rem",
                      right: isSelf ? "-1rem" : "auto",
                      top: "-1.5rem",
                      background: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "20px",
                      padding: "2px 6px",
                      display: "none",
                      gap: "6px",
                      zIndex: 10,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.5)"
                    }}
                  >
                    {["👍", "❤️", "🔥", "😂", "🎉"].map(emoji => (
                      <span
                        key={emoji}
                        onClick={() => handleToggleReaction(msg.id, emoji)}
                        style={{ cursor: "pointer", fontSize: "0.95rem", transition: "transform 0.1s" }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.25)"}
                        onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                      >
                        {emoji}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Render Active Reactions List */}
          {Object.keys(reactionsMap).length > 0 && (
            <div className="msg-reactions-list" style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
              {Object.entries(reactionsMap).map(([emoji, users]) => {
                const hasReacted = users.includes(user?.email || "");
                return (
                  <div
                    key={emoji}
                    onClick={() => handleToggleReaction(msg.id, emoji)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                      padding: "2px 6px",
                      borderRadius: "12px",
                      background: hasReacted ? "rgba(99, 102, 241, 0.2)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${hasReacted ? "rgba(99, 102, 241, 0.4)" : "rgba(255,255,255,0.08)"}`,
                      fontSize: "0.75rem",
                      color: hasReacted ? "var(--primary)" : "var(--text-secondary)",
                      cursor: "pointer",
                      userSelect: "none"
                    }}
                  >
                    <span>{emoji}</span>
                    <span>{users.length}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Helper to render attachment and input form
  const renderChatInputForm = (placeholderText: string) => {
    return (
      <div className="chat-input-wrapper-container" style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {/* Attached file preview */}
        {attachedFile && (
          <div
            className="attached-file-preview-bar"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              background: "rgba(99, 102, 241, 0.1)",
              borderTop: "1px solid rgba(99, 102, 241, 0.2)",
              borderBottom: "1px solid rgba(99, 102, 241, 0.2)"
            }}
          >
            <FileText size={16} color="var(--primary)" />
            <span style={{ fontSize: "0.85rem", color: "#fff", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {attachedFile.name}
            </span>
            <button
              type="button"
              onClick={() => setAttachedFile(null)}
              style={{
                background: "none",
                border: "none",
                color: "#ff8a8a",
                cursor: "pointer",
                padding: "2px"
              }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="chat-input-form" style={{ position: "relative" }}>
          {/* File Input Trigger */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="chat-toolbar-btn"
            disabled={uploadingFile}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-secondary)",
              padding: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {uploadingFile ? (
              <Loader2 size={16} className="spinning-loader" />
            ) : (
              <Paperclip size={16} />
            )}
          </button>

          {/* Emoji Selector Popover Trigger */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="chat-toolbar-btn"
              style={{
                background: "none",
                border: "none",
                color: "var(--text-secondary)",
                padding: "8px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Smile size={16} />
            </button>

            {showEmojiPicker && (
              <div
                className="chat-emoji-picker-popover"
                style={{
                  position: "absolute",
                  bottom: "3rem",
                  left: "0",
                  background: "#0f172a",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  padding: "0.5rem",
                  display: "grid",
                  gridTemplateColumns: "repeat(5, 1fr)",
                  gap: "6px",
                  zIndex: 20,
                  boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
                  width: "180px"
                }}
              >
                {["👍", "❤️", "🔥", "😂", "🎉", "🚀", "💡", "💯", "👏", "💬"].map(emoji => (
                  <span
                    key={emoji}
                    onClick={() => {
                      setInputText(prev => prev + emoji);
                      setShowEmojiPicker(false);
                    }}
                    style={{
                      cursor: "pointer",
                      fontSize: "1.1rem",
                      padding: "4px",
                      textAlign: "center",
                      borderRadius: "6px",
                      transition: "background 0.2s"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.08)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            )}
          </div>

          <input
            type="text"
            placeholder={placeholderText}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="chat-text-input"
            style={{ flex: 1 }}
          />

          <button type="submit" className="chat-send-btn">
            <Send size={16} />
          </button>
        </form>
      </div>
    );
  };

  return (
    <div className="dashboard-root">
      {/* Background canvas elements */}
      <div className="bg-canvas" />
      <div className="bg-grid" />

      {/* Header */}
      <header className="navbar dashboard-navbar">
        <div className="navbar-container">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span className="navbar-logo text-gradient">BUILDWITHSSP</span>
            <span className="dashboard-badge">
              {userRole === "owner" ? "Super Admin" : "Client Hub"}
            </span>
          </div>

          <nav className="nav-desktop" style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {userRole === "client" && (
              <a href="/about" className="nav-portfolio-link">
                Owner Portfolio <ExternalLink size={14} style={{ marginLeft: "4px", display: "inline" }} />
              </a>
            )}
            <div
              className="client-profile-avatar"
              onClick={() => setActiveTab("profile")}
              style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  style={{ width: "20px", height: "20px", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <User size={16} />
              )}
              <span>{userRole === "owner" ? (user?.name ? `${user.name} (Owner)` : "Surya Prakash S (Owner)") : (user?.name || "Acme Corp")}</span>
            </div>
            <button
              onClick={handleLogout}
              className="nav-portfolio-link"
              style={{ background: "rgba(239, 68, 68, 0.1)", borderColor: "rgba(239, 68, 68, 0.2)", color: "#f87171 !important" }}
            >
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="dashboard-container">
        {/* Sidebar Nav */}
        <aside className="dashboard-sidebar glass-panel">
          <div className="sidebar-project-select">
            <label>Active Engagements</label>
            <select
              value={activeProjectId}
              onChange={(e) => {
                setActiveProjectId(e.target.value);
                setActiveTab("projects");
              }}
              className="project-dropdown"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
              {projects.length === 0 && (
                <option value="none">No active projects</option>
              )}
            </select>
          </div>

          <div className="sidebar-nav-list">
            <button
              onClick={() => setActiveTab("projects")}
              className={`sidebar-nav-btn ${activeTab === "projects" ? "active" : ""}`}
            >
              <Layers size={18} />
              <span>{userRole === "owner" ? "Admin Console" : "Project Tracker"}</span>
            </button>

            <button
              onClick={() => setActiveTab("chat")}
              className={`sidebar-nav-btn ${activeTab === "chat" ? "active" : ""}`}
              disabled={activeProjectId === "none"}
            >
              <MessageSquare size={18} />
              <span>Direct Chat</span>
              {filteredMessages.length > 0 && <span className="chat-notification-dot"></span>}
            </button>

            <button
              onClick={() => setActiveTab("billing")}
              className={`sidebar-nav-btn ${activeTab === "billing" ? "active" : ""}`}
              disabled={activeProjectId === "none"}
            >
              <CreditCard size={18} />
              <span>Milestone Billing</span>
            </button>

            <button
              onClick={() => setActiveTab("calendar")}
              className={`sidebar-nav-btn ${activeTab === "calendar" ? "active" : ""}`}
              disabled={activeProjectId === "none"}
            >
              <Calendar size={18} />
              <span>Sync Scheduling</span>
            </button>

            {userRole === "owner" ? (
              <>
                <button
                  onClick={() => setActiveTab("brief-inbox")}
                  className={`sidebar-nav-btn ${activeTab === "brief-inbox" ? "active" : ""}`}
                  style={{ marginTop: "2rem", borderColor: "rgba(6, 182, 212, 0.3)", background: "rgba(6, 182, 212, 0.05)" }}
                >
                  <PlusCircle size={18} style={{ color: "var(--accent)" }} />
                  <span style={{ color: "var(--text-primary)" }}>Brief Inbox</span>
                  {briefs.filter(b => b.status === "pending").length > 0 && (
                    <span className="chat-notification-dot" style={{ background: "var(--accent)", marginLeft: "auto" }}></span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("settings")}
                  className={`sidebar-nav-btn ${activeTab === "settings" ? "active" : ""}`}
                  style={{ marginTop: "0.5rem" }}
                >
                  <Settings size={18} />
                  <span>Security Settings</span>
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`sidebar-nav-btn ${activeTab === "profile" ? "active" : ""}`}
                  style={{ marginTop: "0.5rem" }}
                >
                  <User size={18} />
                  <span>Profile Settings</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab("new-brief")}
                  className={`sidebar-nav-btn ${activeTab === "new-brief" ? "active" : ""}`}
                  style={{ marginTop: "2rem", borderColor: "rgba(6, 182, 212, 0.3)", background: "rgba(6, 182, 212, 0.05)" }}
                >
                  <PlusCircle size={18} style={{ color: "var(--accent)" }} />
                  <span style={{ color: "var(--text-primary)" }}>New Brief</span>
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`sidebar-nav-btn ${activeTab === "profile" ? "active" : ""}`}
                  style={{ marginTop: "0.5rem" }}
                >
                  <User size={18} />
                  <span>Profile Settings</span>
                </button>
              </>
            )}
          </div>

          <div className="sidebar-footer">
            <a href="/about" className="owner-card" title="View Portfolio">
              <div className="owner-avatar">
                <Image src="/images/profile.jfif" alt="Surya Prakash S" width={36} height={36} className="avatar-img" onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80";
                }} />
              </div>
              <div className="owner-info">
                <h4>Surya Prakash S</h4>
                <p>Lead Engineer</p>
              </div>
              <div className="owner-arrow">
                <ChevronRight size={18} />
              </div>
            </a>
          </div>
        </aside>

        {/* Dashboard Main Content Panel */}
        <main className="dashboard-content">

          {/* TAB 1: PROJECTS TRACKER / ADMIN CONSOLE */}
          {activeTab === "projects" && (
            <div className="dashboard-view">
              <div className="view-header">
                <div>
                  <span className="section-pre-title">{userRole === "owner" ? "Super Admin View" : "Project Workspace"}</span>
                  <h1 className="text-glow">{activeProject.name}</h1>
                </div>
                {activeProjectId !== "none" && (
                  <div className="status-indicator">
                    <span className={`status-dot-pulse ${activeProject.status.replace(/\s+/g, '-').toLowerCase()}`}></span>
                    <span className="status-text">{activeProject.status}</span>
                  </div>
                )}
              </div>

              {activeProjectId !== "none" && (
                <>
                  {/* Progress Panel */}
                  <div className="progress-panel glass-panel">
                    <div className="progress-panel-header">
                      <h3>Overall Completion</h3>
                      <span className="text-gradient progress-percent">{activeProject.progress}%</span>
                    </div>
                    <div className="progress-track-bg">
                      <div className="progress-track-fill" style={{ width: `${activeProject.progress}%` }}></div>
                    </div>

                    {/* Steps Visualizer */}
                    <div className="timeline-phases">
                      {["Discovery", "Design", "Development", "Testing", "Launch"].map((phase, idx) => {
                        const phases = ["Discovery", "Design", "Development", "Testing", "Launch"];
                        const currentIdx = phases.indexOf(activeProject.phase);
                        const isCompleted = idx < currentIdx;
                        const isActive = idx === currentIdx;

                        return (
                          <div key={phase} className={`phase-step ${isCompleted ? "completed" : ""} ${isActive ? "active" : ""}`}>
                            <div className="phase-marker">
                              {isCompleted ? <CheckCircle2 size={16} /> : <span>{idx + 1}</span>}
                            </div>
                            <span className="phase-label">{phase}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Super Admin Control panel - Only for Owner */}
                  {userRole === "owner" && (
                    <div className="deliverables-panel glass-panel" style={{ marginBottom: "2rem" }}>
                      <div className="panel-title-bar">
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Layers size={20} color="var(--primary)" />
                          <h3>Admin Project Controls</h3>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
                        <div className="form-group">
                          <label>Project Completion ({activeProject.progress}%)</label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={activeProject.progress}
                            onChange={(e) => handleUpdateProgress(Number(e.target.value))}
                            style={{ width: "100%", accentColor: "var(--primary)", marginTop: "0.5rem", cursor: "pointer" }}
                          />
                        </div>

                        <div className="form-group">
                          <label>Project Phase</label>
                          <select
                            value={activeProject.phase}
                            onChange={(e) => handleUpdatePhase(e.target.value as any)}
                            className="project-dropdown"
                            style={{ marginTop: "0.25rem" }}
                          >
                            {["Discovery", "Design", "Development", "Testing", "Launch"].map(ph => (
                              <option key={ph} value={ph}>{ph}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Project Status</label>
                          <select
                            value={activeProject.status}
                            onChange={(e) => handleUpdateStatus(e.target.value as any)}
                            className="project-dropdown"
                            style={{ marginTop: "0.25rem" }}
                          >
                            {["On Track", "In Review", "Pending Client", "Delayed"].map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.5rem" }}>
                        {/* Add Deliverable Form */}
                        <form onSubmit={handleAdminAddDeliverable} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                          <h4 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", color: "var(--primary)" }}>+ Add Deliverable</h4>
                          <input
                            type="text"
                            placeholder="Deliverable Name"
                            value={adminDelName}
                            onChange={(e) => setAdminDelName(e.target.value)}
                            className="form-input"
                            required
                          />
                          <select
                            value={adminDelPhase}
                            onChange={(e) => setAdminDelPhase(e.target.value)}
                            className="project-dropdown"
                          >
                            {["Discovery", "Design", "Development", "Testing", "Launch"].map(ph => (
                              <option key={ph} value={ph}>{ph} Phase</option>
                            ))}
                          </select>
                          <button type="submit" className="widget-action-btn" style={{ background: "rgba(99, 102, 241, 0.15)", color: "var(--primary)", borderColor: "rgba(99, 102, 241, 0.3)" }}>
                            Add Deliverable
                          </button>
                        </form>

                        {/* Add Invoice Form */}
                        <form onSubmit={handleAdminAddInvoice} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                          <h4 style={{ fontSize: "0.85rem", fontWeight: 700, textTransform: "uppercase", color: "var(--accent)" }}>+ Generate Invoice</h4>
                          <input
                            type="text"
                            placeholder="Invoice Title"
                            value={adminInvTitle}
                            onChange={(e) => setAdminInvTitle(e.target.value)}
                            className="form-input"
                            required
                          />
                          <input
                            type="number"
                            placeholder="Amount ($)"
                            value={adminInvAmount}
                            onChange={(e) => setAdminInvAmount(e.target.value)}
                            className="form-input"
                            required
                          />
                          <button type="submit" className="widget-action-btn" style={{ background: "rgba(6, 182, 212, 0.15)", color: "var(--accent)", borderColor: "rgba(6, 182, 212, 0.3)" }}>
                            Generate Invoice
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* Grid: Deliverables and Snapshot stats */}
                  <div className="dashboard-grid-two">
                    {/* Deliverables Panel */}
                    <div className="deliverables-panel glass-panel">
                      <div className="panel-title-bar">
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <FileCheck size={20} color="var(--primary)" />
                          <h3>Deliverables Review Board</h3>
                        </div>
                        <span className="panel-badge">{activeProject.deliverables.length} Deliverables</span>
                      </div>

                      <p className="panel-instructions">
                        {userRole === "owner"
                          ? "Deliverables checklist and review feedbacks submitted by the client."
                          : "Review specifications, designs, or staging logs. Click Approve to proceed or request adjustments."}
                      </p>

                      <div className="deliverables-list">
                        {activeProject.deliverables.map(del => (
                          <div key={del.id} className={`deliverable-card ${del.status}`}>
                            <div className="del-header">
                              <div>
                                <span className="del-phase">{del.phase}</span>
                                <h4 className="del-name">{del.name}</h4>
                              </div>
                              <span className={`del-badge ${del.status}`}>
                                {del.status === "approved" ? "Approved" : del.status === "revision" ? "Revision Pending" : "Awaiting Review"}
                              </span>
                            </div>

                            {del.feedback && (
                              <div className="del-feedback-box">
                                <strong>Client Revision Feedback:</strong>
                                <p>{del.feedback}</p>
                              </div>
                            )}

                            <div className="del-actions">
                              {del.link && (
                                <a href={del.link} target="_blank" rel="noopener noreferrer" className="del-link-btn">
                                  View File <ExternalLink size={12} />
                                </a>
                              )}

                              {userRole === "client" && del.status !== "approved" && (
                                <div style={{ display: "flex", gap: "0.5rem", marginLeft: "auto" }}>
                                  <button
                                    onClick={() => handleOpenRevisionModal(del)}
                                    className="del-action-btn revision-btn"
                                  >
                                    Request Changes
                                  </button>
                                  <button
                                    onClick={() => handleApproveDeliverable(del.id)}
                                    className="del-action-btn approve-btn"
                                  >
                                    Approve
                                  </button>
                                </div>
                              )}

                              {userRole === "owner" && del.status === "revision" && (
                                <button
                                  onClick={() => handleAdminMarkFixed(del.id)}
                                  className="del-action-btn approve-btn"
                                  style={{ marginLeft: "auto", background: "var(--secondary)", color: "white" }}
                                >
                                  Mark Fixed & Re-Submit
                                </button>
                              )}
                            </div>
                          </div>
                        ))}

                        {activeProject.deliverables.length === 0 && (
                          <p style={{ color: "var(--text-muted)", padding: "2rem", textAlign: "center" }}>No deliverables initialized yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Quick Info & Sidebar widgets */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                      {/* Next Milestone Card */}
                      <div className="quick-widget glass-panel gradient-border-primary">
                        <div className="widget-header">
                          <TrendingUp size={18} color="var(--primary)" />
                          <h4>Next Milestones</h4>
                        </div>
                        <div className="milestone-content">
                          <div className="milestone-next">
                            <Clock size={16} />
                            <div>
                              <h5>Calendar Integrations testing</h5>
                              <p>Due: June 25, 2026</p>
                            </div>
                          </div>
                          <div className="milestone-next locked">
                            <Clock size={16} />
                            <div>
                              <h5>UAT Launch & Deploy</h5>
                              <p>Due: July 15, 2026</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Finance Overview Widget */}
                      <div className="quick-widget glass-panel">
                        <div className="widget-header">
                          <DollarSign size={18} color="var(--accent)" />
                          <h4>Milestone Payments</h4>
                        </div>
                        <div className="billing-widget-body">
                          <div className="billing-stat-row">
                            <span>Paid to Date</span>
                            <span className="val">$4,000</span>
                          </div>
                          <div className="billing-stat-row">
                            <span>Active Invoices</span>
                            <span className="val pending">
                              ${activeProject.invoices.filter(i => i.status === "pending").reduce((a, b) => a + b.amount, 0).toLocaleString()} Pending
                            </span>
                          </div>
                          <button onClick={() => setActiveTab("billing")} className="widget-action-btn">
                            Go to Invoices <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Scheduled Call Sync Widget */}
                      <div className="quick-widget glass-panel">
                        <div className="widget-header">
                          <Calendar size={18} color="var(--secondary)" />
                          <h4>Upcoming Sync Call</h4>
                        </div>
                        <div className="call-sync-body">
                          {activeMeetings.length > 0 ? (
                            <div className="scheduled-call-card">
                              <PhoneCall size={16} />
                              <div>
                                <h5>{activeMeetings[0].topic}</h5>
                                <p>{activeMeetings[0].date} @ {activeMeetings[0].time}</p>
                                {userRole === "owner" && <span style={{ fontSize: "0.7rem", color: "var(--accent)" }}>Client: {activeMeetings[0].clientName}</span>}
                              </div>
                            </div>
                          ) : (
                            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>No sync calls scheduled.</p>
                          )}
                          {userRole === "client" && (
                            <button onClick={() => setActiveTab("calendar")} className="widget-action-btn">
                              Schedule Sync Call <ArrowRight size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeProjectId === "none" && (
                <div className="glass-panel" style={{ padding: "4rem", textAlign: "center", marginTop: "2rem" }}>
                  <Briefcase size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
                  <h3>No Active Projects Loaded</h3>
                  <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                    {userRole === "owner"
                      ? "Go to the Brief Inbox to initialize projects from prospective briefs."
                      : "Submit a project brief to get started!"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DIRECT CHAT (COMING SOON) */}
          {activeTab === "chat" && (
            <div className="dashboard-view">
              <div className="view-header">
                <div>
                  <span className="section-pre-title">Communication Channel</span>
                  <h1 className="text-glow">Direct Chat</h1>
                </div>
              </div>
              <div className="glass-panel" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "6rem 2rem", textAlign: "center", marginTop: "2rem" }}>
                <MessageSquare size={56} style={{ color: "var(--primary)", marginBottom: "1.5rem" }} />
                <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Feature Coming Soon</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", maxWidth: "500px", lineHeight: "1.6", marginBottom: "2rem" }}>
                  The direct chat feature is currently under development and will be available in a future update.
                </p>
                <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
                  <p style={{ color: "var(--text-primary)", fontWeight: 500, marginBottom: "1rem" }}>In the meantime, please contact me directly via:</p>
                  <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                    <a href="https://wa.me/916383513214" target="_blank" rel="noopener noreferrer" className="widget-action-btn" style={{ background: "rgba(37, 211, 102, 0.15)", color: "#25D366", borderColor: "rgba(37, 211, 102, 0.3)", textDecoration: "none" }}>
                      WhatsApp
                    </a>
                    <a href="https://t.me/surya_9122" target="_blank" rel="noopener noreferrer" className="widget-action-btn" style={{ background: "rgba(0, 136, 204, 0.15)", color: "#0088cc", borderColor: "rgba(0, 136, 204, 0.3)", textDecoration: "none" }}>
                      Telegram
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* HIDDEN CHAT IMPLEMENTATION (Coming Later) */}
          {false && activeTab === "chat" && (
            userRole === "owner" ? (
              <div className="chat-split-layout">
                {/* Left Sidebar: Client List */}
                <div className="chat-clients-sidebar glass-panel">
                  <div className="sidebar-header" style={{ paddingBottom: "1rem", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                    <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 600 }}>Client Conversations</h3>
                  </div>
                  <div className="clients-list" style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {clients.map(c => {
                      const clientProj = projects.find(p => p.clientId === c.id);
                      const isSelected = selectedClientId === c.id;
                      return (
                        <div
                          key={c.id}
                          className={`client-item-card ${isSelected ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedClientId(c.id);
                            if (clientProj) {
                              setActiveProjectId(clientProj.id);
                            } else {
                              setActiveProjectId("none");
                            }
                          }}
                          style={{
                            padding: "0.85rem",
                            borderRadius: "8px",
                            background: isSelected ? "rgba(6, 182, 212, 0.15)" : "rgba(255, 255, 255, 0.02)",
                            border: `1px solid ${isSelected ? "rgba(6, 182, 212, 0.3)" : "rgba(255, 255, 255, 0.05)"}`,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem"
                          }}
                        >
                          <div className="client-avatar" style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: isSelected ? "var(--primary)" : "rgba(255, 255, 255, 0.08)",
                            color: isSelected ? "#000" : "var(--text-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                            fontSize: "0.9rem"
                          }}>
                            {c.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="client-info" style={{ flex: 1, minWidth: 0 }}>
                            <div className="client-name" style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                            <div className="client-email" style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.email}</div>
                            <div className="client-project-name" style={{ fontSize: "0.75rem", color: "var(--primary)", marginTop: "2px", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {clientProj ? clientProj.name : "No project active"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {clients.length === 0 && (
                      <p style={{ color: "var(--text-muted)", textAlign: "center", fontSize: "0.85rem", padding: "2rem 0" }}>No registered clients found.</p>
                    )}
                  </div>
                </div>

                {/* Right Column: Chat Feed */}
                <div className="chat-feed-column" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  {selectedClientId ? (
                    activeProjectId !== "none" ? (
                      <div className="dashboard-view chat-view-layout" style={{ height: "100%", padding: 0 }}>
                        <div className="view-header" style={{ marginBottom: "1rem" }}>
                          <div>
                            <span className="section-pre-title">Communication Channel</span>
                            <h1 className="text-glow">Client Chat Console</h1>
                          </div>
                          <div className="chat-status">
                            <span className="online-indicator"></span>
                            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                              Client is online
                            </span>
                          </div>
                        </div>

                        <div className="chat-container-box glass-panel" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 250px)", minHeight: "450px" }}>
                          <div className="chat-messages-scroll" style={{ flex: 1 }}>
                            {filteredMessages.map(msg => renderMessageBubble(msg))}
                            {isTyping && (
                              <div className="chat-bubble-wrapper owner">
                                <div className="chat-avatar-circle">
                                  <Image src="/images/profile.jfif" alt="Surya" width={28} height={28} className="avatar-img" onError={(e) => {
                                    e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=50&q=80";
                                  }} />
                                </div>
                                <div className="chat-bubble-content typing-indicator">
                                  <span></span>
                                  <span></span>
                                  <span></span>
                                </div>
                              </div>
                            )}
                            <div ref={chatBottomRef} />
                          </div>

                          {renderChatInputForm("Type admin reply to client...")}
                        </div>
                      </div>
                    ) : (
                      <div className="glass-panel" style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem", textAlign: "center" }}>
                        <MessageSquare size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
                        <h3>No Active Project</h3>
                        <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                          This client does not have an active project. Approve their brief in the Admin Console to begin chatting.
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="glass-panel" style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem", textAlign: "center" }}>
                      <User size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
                      <h3>Select a Client</h3>
                      <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                        Select a client from the left pane to open their conversation feed.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // CLIENT VIEW
              activeProjectId !== "none" ? (
                <div className="dashboard-view chat-view-layout">
                  <div className="view-header">
                    <div>
                      <span className="section-pre-title">Communication Channel</span>
                      <h1 className="text-glow">Direct Message Feed</h1>
                    </div>
                    <div className="chat-status">
                      <span className="online-indicator"></span>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                        Surya S is Online
                      </span>
                    </div>
                  </div>

                  <div className="chat-container-box glass-panel">
                    <div className="chat-messages-scroll">
                      {filteredMessages.map(msg => renderMessageBubble(msg))}

                      {isTyping && (
                        <div className="chat-bubble-wrapper owner">
                          <div className="chat-avatar-circle">
                            <Image src="/images/profile.jfif" alt="Surya" width={28} height={28} className="avatar-img" onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=50&q=80";
                            }} />
                          </div>
                          <div className="chat-bubble-content typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                          </div>
                        </div>
                      )}
                      <div ref={chatBottomRef} />
                    </div>

                    <div className="chat-suggested-prompts">
                      <button onClick={() => setInputText("Check progress status")} className="suggest-btn">Project Status?</button>
                      <button onClick={() => setInputText("How do I book a sync meeting call?")} className="suggest-btn">Schedule Meeting?</button>
                      <button onClick={() => setInputText("Is there any pending invoice details?")} className="suggest-btn">Check Invoices?</button>
                    </div>

                    {renderChatInputForm("Ask Surya a question about scope, deliverables...")}
                  </div>
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: "4rem", textAlign: "center", marginTop: "2rem" }}>
                  <MessageSquare size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
                  <h3>No Active Projects</h3>
                  <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                    Submit a project brief to get started!
                  </p>
                </div>
              )
            )
          )}

          {/* TAB 3: MILESTONE BILLING & INVOICES */}
          {activeTab === "billing" && activeProjectId !== "none" && (
            <div className="dashboard-view">
              <div className="view-header">
                <div>
                  <span className="section-pre-title">Budget Tracker</span>
                  <h1 className="text-glow">Milestone Invoicing</h1>
                </div>
                <div className="financial-totals">
                  <div className="total-box">
                    <span>Project Value</span>
                    <strong>${activeProject.invoices.reduce((a, b) => a + b.amount, 0).toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="invoices-list-container glass-panel">
                <div className="panel-title-bar">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <CreditCard size={20} color="var(--primary)" />
                    <h3>Phase Milestone Invoices</h3>
                  </div>
                </div>

                <div className="invoices-table">
                  <div className="invoice-row header">
                    <span>Invoice Details</span>
                    <span>Amount</span>
                    <span>Due Date</span>
                    <span>Status</span>
                    <span style={{ textAlign: "right" }}>Action</span>
                  </div>

                  {activeProject.invoices.map(inv => (
                    <div key={inv.id} className={`invoice-row ${inv.status}`}>
                      <div className="inv-title-col">
                        <FileText size={18} />
                        <div>
                          <h4>{inv.title}</h4>
                          <p>INV-{inv.id.slice(0, 8)}</p>
                        </div>
                      </div>
                      <div className="inv-amount-col">
                        <strong>${inv.amount.toLocaleString()}</strong>
                      </div>
                      <div className="inv-date-col">
                        <span>{inv.dueDate}</span>
                      </div>
                      <div className="inv-status-col">
                        <span className={`status-tag ${inv.status}`}>{inv.status.toUpperCase()}</span>
                      </div>
                      <div className="inv-action-col" style={{ textAlign: "right" }}>
                        {inv.status === "pending" && userRole === "client" && (
                          <button
                            onClick={() => handleOpenPaymentModal(inv)}
                            className="pay-btn"
                          >
                            Pay Milestone
                          </button>
                        )}
                        {inv.status === "pending" && userRole === "owner" && (
                          <span className="locked-text" style={{ color: "var(--accent)" }}>Client Action Pending</span>
                        )}
                        {inv.status === "paid" && (
                          <span className="receipt-text">Receipt Available</span>
                        )}
                        {inv.status === "locked" && userRole === "client" && (
                          <span className="locked-text">Locked until prior phase</span>
                        )}
                        {inv.status === "locked" && userRole === "owner" && (
                          <button
                            onClick={() => handleAdminUnlockInvoice(inv.id)}
                            className="pay-btn"
                            style={{ background: "var(--primary)" }}
                          >
                            Unlock Invoice
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {activeProject.invoices.length === 0 && (
                    <p style={{ color: "var(--text-muted)", padding: "2rem", textAlign: "center" }}>No invoices generated yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SYNC MEETING SCHEDULER */}
          {activeTab === "calendar" && activeProjectId !== "none" && (
            <div className="dashboard-view">
              <div className="view-header">
                <div>
                  <span className="section-pre-title">Schedultron Integration</span>
                  <h1 className="text-glow">Quick Sync Scheduling</h1>
                </div>
              </div>

              <div className="dashboard-grid-two">
                {/* Calendar Selection Card */}
                <div className="scheduler-card glass-panel">
                  <div className="panel-title-bar">
                    <h3>Select Slot & Date</h3>
                  </div>

                  <form onSubmit={handleScheduleCall} className="scheduler-form">
                    <div className="form-group">
                      <label>Choose Sync Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min="2026-06-18"
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Available Booking Slots</label>
                      <div className="time-slots-grid">
                        {["10:00 AM", "11:30 AM", "2:00 PM", "3:30 PM", "5:00 PM"].map(time => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={`time-slot-btn ${selectedTime === time ? "selected" : ""}`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Meeting Scope / Focus Area</label>
                      <input
                        type="text"
                        placeholder="e.g. Schedultron UI review, Calendar styling hooks discussion"
                        value={meetingTopic}
                        onChange={(e) => setMeetingTopic(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>

                    <button type="submit" className="submit-schedule-btn" disabled={!selectedTime}>
                      Book Sync Meeting
                    </button>
                  </form>
                </div>

                {/* Scheduled Meetings Card */}
                <div className="scheduler-list-card glass-panel">
                  <div className="panel-title-bar">
                    <h3>Your Scheduled Sessions</h3>
                  </div>

                  <div className="meetings-list">
                    {activeMeetings.length > 0 ? (
                      activeMeetings.map(meet => (
                        <div key={meet.id} className="meeting-item-card">
                          <div className="meet-icon-box">
                            <Calendar size={20} />
                          </div>
                          <div className="meet-info-box">
                            <h4>{meet.topic}</h4>
                            <div className="meet-meta-row">
                              <span>📅 {meet.date}</span>
                              <span>⏰ {meet.time} ({meet.duration})</span>
                            </div>
                            {userRole === "owner" && (
                              <span style={{ fontSize: "0.75rem", color: "var(--accent)", fontWeight: 600 }}>
                                Client: {meet.clientName}
                              </span>
                            )}
                            {(meet as any).link ? (
                              <a href={(meet as any).link} target="_blank" rel="noreferrer" className="meets-link-badge" style={{ textDecoration: 'none', display: 'inline-block', marginTop: '0.5rem' }}>
                                Join Google Meet
                              </a>
                            ) : (
                              <span className="meets-link-badge" style={{ marginTop: '0.5rem', display: 'inline-block' }}>Google Meet: ready-to-join</span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p style={{ color: "var(--text-muted)", padding: "2rem", textAlign: "center" }}>No meetings booked yet.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: NEW BRIEF ENGAGEMENTS (CLIENT ONLY) */}
          {activeTab === "new-brief" && userRole === "client" && (
            <div className="dashboard-view">
              <div className="view-header">
                <div>
                  <span className="section-pre-title">Scale Engagements</span>
                  <h1 className="text-glow">Submit New Project Brief</h1>
                </div>
              </div>

              <div className="new-brief-form-container glass-panel" style={{ maxWidth: "700px" }}>
                {newProjectSuccess ? (
                  <div className="form-success-state">
                    <CheckCircle2 size={48} color="#22c55e" />
                    <h2>Project Specs Received!</h2>
                    <p>Brief submitted to database. Loading details...</p>
                    <Loader2 className="spinning-loader" size={24} style={{ marginTop: "1rem" }} />
                  </div>
                ) : (
                  <form onSubmit={handleCreateNewProject} className="new-project-brief-form">
                    <div className="form-group">
                      <label>Project Name / Initiative</label>
                      <input
                        type="text"
                        placeholder="e.g. Connectro Micro-frontend Upgrade"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Estimated Project Budget ($)</label>
                      <input
                        type="number"
                        placeholder="e.g. 10000"
                        value={newProjectBudget}
                        onChange={(e) => setNewProjectBudget(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Core Scope & Features Description</label>
                      <textarea
                        placeholder="Detail the core user flows, integration needs, time frame constraints..."
                        value={newProjectDesc}
                        onChange={(e) => setNewProjectDesc(e.target.value)}
                        className="form-textarea"
                        rows={6}
                        required
                      />
                    </div>

                    <button type="submit" className="submit-brief-btn">
                      Submit Brief Details
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: BRIEF INBOX FOR OWNER */}
          {activeTab === "brief-inbox" && userRole === "owner" && (
            <div className="dashboard-view">
              <div className="view-header">
                <div>
                  <span className="section-pre-title">Client Acquisition</span>
                  <h1 className="text-glow">Submitted Project Briefs</h1>
                </div>
              </div>

              <div className="deliverables-panel glass-panel">
                <div className="panel-title-bar">
                  <h3>Brief Submissions Inbox</h3>
                  <span className="panel-badge">{briefs.length} Briefs</span>
                </div>

                <p className="panel-instructions">
                  Review specifications submitted by prospective clients. Approve to create a live project workspace.
                </p>

                <div className="deliverables-list" style={{ marginTop: "1rem" }}>
                  {briefs.map(brief => (
                    <div key={brief.id} className="deliverable-card" style={{ borderColor: brief.status === "approved" ? "rgba(34,197,94,0.15)" : brief.status === "declined" ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)" }}>
                      <div className="del-header">
                        <div>
                          <span className="del-phase">{brief.clientName}</span>
                          <h4 className="del-name">{brief.projectName}</h4>
                        </div>
                        <span className={`del-badge ${brief.status === "approved" ? "approved" : brief.status === "declined" ? "revision" : "pending"}`}>
                          {brief.status.toUpperCase()}
                        </span>
                      </div>

                      <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: "1.5", margin: "0.5rem 0" }}>
                        {brief.description}
                      </p>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem", marginTop: "0.5rem" }}>
                        <strong style={{ color: "var(--accent)" }}>Estimated Budget: ${brief.budget.toLocaleString()}</strong>

                        {brief.status === "pending" && (
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              onClick={() => handleDeclineBrief(brief.id)}
                              className="del-action-btn revision-btn"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleApproveBrief(brief)}
                              className="del-action-btn approve-btn"
                            >
                              Approve & Create Project
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {briefs.length === 0 && (
                    <p style={{ color: "var(--text-muted)", padding: "2rem", textAlign: "center" }}>No briefs in the inbox.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: SECURITY & SESSION SETTINGS FOR OWNER */}
          {activeTab === "settings" && userRole === "owner" && (
            <div className="dashboard-view">
              <div className="view-header">
                <div>
                  <span className="section-pre-title">System Administration</span>
                  <h1 className="text-glow">Security Settings</h1>
                </div>
              </div>

              <div className="deliverables-panel glass-panel" style={{ maxWidth: "600px" }}>
                <div className="panel-title-bar">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Settings size={20} className="text-gradient" />
                    <h3>Session & Security Settings</h3>
                  </div>
                </div>

                <p className="panel-instructions">
                  Configure inactivity limits and session policies. These rules apply to all workspace members.
                </p>

                <form onSubmit={handleSaveSettings} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1.5rem" }}>
                  {saveSettingsSuccess && (
                    <div className="login-success-msg animate-pop" style={{ background: "rgba(34, 197, 94, 0.15)", border: "1px solid rgba(34, 197, 94, 0.3)", color: "#22c55e", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", textAlign: "center" }}>
                      ✓ Security settings updated successfully and synced in real-time.
                    </div>
                  )}

                  <div className="form-group">
                    <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <span>Inactivity Logout Timeout (minutes)</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "normal" }}>
                        Users will be logged out after this many minutes of inactivity.
                      </span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1440"
                      value={settingsIdleTimeout}
                      onChange={(e) => setSettingsIdleTimeout(Number(e.target.value))}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <span>Warning Dialog Countdown (seconds)</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "normal" }}>
                        How many seconds before timeout to show the countdown warning dialog.
                      </span>
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="300"
                      value={settingsWarningDuration}
                      onChange={(e) => setSettingsWarningDuration(Number(e.target.value))}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <span>Absolute Session Lifetime (hours)</span>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "normal" }}>
                        The absolute maximum duration of a session from login, regardless of activity.
                      </span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="720"
                      value={settingsAbsoluteTimeout}
                      onChange={(e) => setSettingsAbsoluteTimeout(Number(e.target.value))}
                      className="form-input"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={saveSettingsLoading}
                    className="submit-brief-btn"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem"
                    }}
                  >
                    {saveSettingsLoading ? (
                      <>
                        <Loader2 className="spinning-loader" size={18} />
                        Saving Settings...
                      </>
                    ) : (
                      "Apply Security Configuration"
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 8: PROFILE SETTINGS */}
          {activeTab === "profile" && (
            <div className="dashboard-view">
              <div className="view-header">
                <div>
                  <span className="section-pre-title">Personal Settings</span>
                  <h1 className="text-glow">Profile Settings</h1>
                </div>
              </div>

              <div className="deliverables-panel glass-panel" style={{ maxWidth: "700px" }}>
                <div className="panel-title-bar">
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <User size={20} className="text-gradient" />
                    <h3>Edit Profile Details</h3>
                  </div>
                </div>

                <p className="panel-instructions">
                  Update your name, contact email, gender, date of birth, profile image, and biography.
                </p>

                <form onSubmit={handleSaveProfile} style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1.5rem" }}>
                  {saveProfileSuccess && (
                    <div className="login-success-msg animate-pop" style={{ background: "rgba(34, 197, 94, 0.15)", border: "1px solid rgba(34, 197, 94, 0.3)", color: "#22c55e", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", textAlign: "center" }}>
                      ✓ Profile settings updated successfully.
                    </div>
                  )}

                  {saveProfileError && (
                    <div className="login-error-msg animate-pop" style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#f87171", padding: "0.75rem", borderRadius: "8px", fontSize: "0.85rem", textAlign: "center" }}>
                      ⚠ {saveProfileError}
                    </div>
                  )}

                  {/* Profile Image Upload Component */}
                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", background: "rgba(255, 255, 255, 0.02)", padding: "1.25rem", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    <div style={{ position: "relative", width: "80px", height: "80px", borderRadius: "50%", overflow: "hidden", background: "rgba(255, 255, 255, 0.05)", border: "2px solid var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {profileImageUrl ? (
                        <img src={profileImageUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <User size={36} color="var(--text-muted)" />
                      )}
                      {uploadingProfileImage && (
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Loader2 className="spinning-loader" size={20} />
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <h4 style={{ fontSize: "0.95rem", fontWeight: 700 }}>Profile Image</h4>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>JPG, PNG or WEBP. Max size 2MB.</p>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <label className="widget-action-btn" style={{ background: "rgba(99, 102, 241, 0.15)", color: "var(--primary)", borderColor: "rgba(99, 102, 241, 0.3)", cursor: "pointer", fontSize: "0.8rem", padding: "0.4rem 0.8rem", display: "inline-flex", alignItems: "center", gap: "0.35rem", borderRadius: "8px", border: "1px solid rgba(99, 102, 241, 0.3)" }}>
                          <Paperclip size={12} />
                          <span>Upload Image</span>
                          <input type="file" accept="image/*" onChange={handleProfileImageUpload} style={{ display: "none" }} disabled={uploadingProfileImage} />
                        </label>
                        {profileImageUrl && (
                          <button type="button" onClick={() => setProfileImageUrl("")} className="widget-action-btn" style={{ background: "rgba(239, 68, 68, 0.1)", color: "#f87171", borderColor: "rgba(239, 68, 68, 0.2)", fontSize: "0.8rem", padding: "0.4rem 0.8rem", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => setProfileEmail(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                    <div className="form-group">
                      <label>Mobile Number</label>
                      <input
                        type="tel"
                        placeholder="e.g. +1 555-0199"
                        value={profileMobile}
                        onChange={(e) => setProfileMobile(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Gender</label>
                      <select
                        value={profileGender}
                        onChange={(e) => setProfileGender(e.target.value)}
                        className="project-dropdown"
                        style={{ marginTop: "0.25rem", background: "rgba(15, 23, 42, 0.6)", border: "1px solid var(--card-border)", color: "var(--text-primary)" }}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                    <div className="form-group">
                      <label>Date of Birth</label>
                      <input
                        type="date"
                        value={profileDob}
                        onChange={(e) => setProfileDob(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>Account Role (Read-only)</label>
                      <input
                        type="text"
                        value={userRole === "owner" ? "Super Admin / Portfolio Owner" : "Client Partner"}
                        className="form-input"
                        style={{ opacity: 0.6, cursor: "not-allowed", background: "rgba(255,255,255,0.02)" }}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Short Biography</label>
                    <textarea
                      placeholder="Write a short summary about yourself or your company..."
                      value={profileBio}
                      onChange={(e) => setProfileBio(e.target.value)}
                      className="form-textarea"
                      rows={4}
                    />
                  </div>

                  {/* Change Password Section */}
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.5rem", marginTop: "0.5rem" }}>
                    <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--accent)", marginBottom: "1rem" }}>Security Options (Change Password)</h4>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div className="form-group">
                        <label>Current Password</label>
                        <input
                          type="password"
                          placeholder="Enter current password to authorize change"
                          value={profileCurrentPassword}
                          onChange={(e) => setProfileCurrentPassword(e.target.value)}
                          className="form-input"
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                        <div className="form-group">
                          <label>New Password</label>
                          <input
                            type="password"
                            placeholder="Leave blank to keep current"
                            value={profileNewPassword}
                            onChange={(e) => setProfileNewPassword(e.target.value)}
                            className="form-input"
                          />
                        </div>

                        <div className="form-group">
                          <label>Confirm New Password</label>
                          <input
                            type="password"
                            placeholder="Leave blank to keep current"
                            value={profileConfirmPassword}
                            onChange={(e) => setProfileConfirmPassword(e.target.value)}
                            className="form-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saveProfileLoading || uploadingProfileImage}
                    className="submit-brief-btn"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      marginTop: "1rem"
                    }}
                  >
                    {saveProfileLoading ? (
                      <>
                        <Loader2 className="spinning-loader" size={18} />
                        Saving Profile...
                      </>
                    ) : (
                      "Save Profile Settings"
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL 1: PAY BILLING MILESTONE INVOICE */}
      {payingInvoice && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <button className="close-modal-btn" onClick={() => setPayingInvoice(null)}>×</button>

            {paymentSuccess ? (
              <div className="payment-success-content">
                <CheckCircle2 size={64} color="#22c55e" className="animate-pop" />
                <h2 className="text-glow">Payment Confirmed!</h2>
                <p>Transaction ID: tx_{payingInvoice.id.slice(0, 8)}_{Date.now().toString().slice(-4)}</p>
                <div className="paid-amount">${payingInvoice.amount.toLocaleString()}</div>
                <p style={{ color: "var(--text-secondary)" }}>
                  Milestone Status updated. A payment confirmation receipt has been sent to client inbox.
                </p>
                <button onClick={() => setPayingInvoice(null)} className="dismiss-modal-btn">
                  Back to Dashboard
                </button>
              </div>
            ) : (
              <form onSubmit={handleProcessPayment} className="payment-details-form">
                <h2 className="text-glow">Authorize Payment</h2>
                <p className="payment-invoice-title">Milestone: {payingInvoice.title}</p>
                <div className="payment-invoice-amount">${payingInvoice.amount.toLocaleString()}</div>

                <div className="form-group">
                  <label>Cardholder Name</label>
                  <input type="text" placeholder="Acme Corporation Inc" className="form-input" required />
                </div>

                <div className="form-group">
                  <label>Credit Card Number</label>
                  <input
                    type="text"
                    placeholder="4111 2222 3333 4444"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="form-input"
                    maxLength={19}
                    required
                  />
                </div>

                <div className="form-row-two">
                  <div className="form-group">
                    <label>Expiration</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="form-input"
                      maxLength={5}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>CVC</label>
                    <input
                      type="password"
                      placeholder="•••"
                      value={cardCVC}
                      onChange={(e) => setCardCVC(e.target.value)}
                      className="form-input"
                      maxLength={3}
                      required
                    />
                  </div>
                </div>

                <div className="security-guarantees">
                  <ShieldAlert size={16} />
                  <span>Secure 256-bit encrypted checkout sandbox.</span>
                </div>

                <button type="submit" className="submit-payment-btn" disabled={paymentLoading}>
                  {paymentLoading ? (
                    <>
                      <Loader2 className="spinning-loader" size={18} />
                      <span>Verifying Card Details...</span>
                    </>
                  ) : (
                    <span>Pay ${payingInvoice.amount.toLocaleString()} Securely</span>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: DELIVERABLE REVISION FEEDBACK */}
      {revisionDeliverable && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <button className="close-modal-btn" onClick={() => setRevisionDeliverable(null)}>×</button>

            <div className="revision-form-content">
              <h2 className="text-glow">Submit Revision Notes</h2>
              <p className="revision-del-subtitle">Deliverable: {revisionDeliverable.name}</p>

              <div className="form-group" style={{ marginTop: "1.5rem" }}>
                <label>Change Request Description</label>
                <textarea
                  placeholder="Detail the adjustments required. For UI changes, provide styling hooks or layout alignment specifications..."
                  value={revisionFeedback}
                  onChange={(e) => setRevisionFeedback(e.target.value)}
                  className="form-textarea"
                  rows={5}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                <button
                  type="button"
                  onClick={() => setRevisionDeliverable(null)}
                  className="cancel-revision-btn"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitRevision}
                  className="submit-revision-btn"
                  disabled={!revisionFeedback.trim()}
                >
                  Submit Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
