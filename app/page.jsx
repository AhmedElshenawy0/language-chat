"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Tag, Tooltip, Avatar, Badge, Drawer } from "antd";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  PlusOutlined,
  SendOutlined,
  AudioOutlined,
  PaperClipOutlined,
  SettingOutlined,
  ShareAltOutlined,
  MoreOutlined,
  SafetyCertificateOutlined,
  InfoCircleOutlined,
  TableOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  BulbOutlined,
  MenuOutlined,
  CloseOutlined,
  CopyOutlined,
  CheckOutlined,
  StarOutlined,
  MessageOutlined,
  GlobalOutlined,
  BookOutlined,
  TranslationOutlined,
  SoundOutlined,
} from "@ant-design/icons";

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const C = {
  primary: "#2DD4BF",
  primaryDark: "#0F9488",
  primaryGlow: "#2DD4BF28",
  accent: "#67E8F9",
  surface: "#111827",
  surfaceLow: "#1A2336",
  surfaceLowest: "#1F2B40",
  surfaceHigh: "#253047",
  surfaceHighest: "#2C3A55",
  onSurface: "#E2E8F4",
  onSurfaceVar: "#7A8BA8",
  outlineVar: "#2A3A55",
  error: "#F87171",
  amber50: "#1C1A10",
  amber200: "#3D3010",
  amber700: "#FBBF24",
  amber900: "#FDE68A",
  msgUser: "#0F9488",
  msgBot: "#1F2B40",
};

/* ─── React Query client ─────────────────────────────────────────────────── */
const queryClient = new QueryClient();

/* ─── Breakpoints ────────────────────────────────────────────────────────── */
function useBreakpoint() {
  const [w, setW] = useState(1200);

  useEffect(() => {
    setW(window.innerWidth);
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  return {
    isMobile: w < 640,
    isTablet: w >= 640 && w < 1024,
    isDesktop: w >= 1024,
  };
}

/* ─── Session helpers ────────────────────────────────────────────────────── */
const SESSION_KEY = "lc_sessions";
const MAX_SESSIONS = 3;

function loadSessions() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveSessions(list) {
  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify(list.slice(0, MAX_SESSIONS)),
  );
}

function makeSession(id, firstMessage) {
  return {
    id,
    title: firstMessage.slice(0, 32) + (firstMessage.length > 32 ? "…" : ""),
    time: "Just now",
    tag: "New",
    active: true,
  };
}

/* ─── Static data ────────────────────────────────────────────────────────── */
const CHIPS = [
  "Spanish Course",
  "Compare Plans",
  "Japanese",
  "Grammar Help",
  "Upgrade Plan",
];

const SIDE_ACTIONS = [
  { label: "View Pricing Table", icon: <TableOutlined /> },
  { label: "Sales Script", icon: <FileTextOutlined /> },
  { label: "Onboarding Steps", icon: <ThunderboltOutlined /> },
];

/* ─── sendToAI ───────────────────────────────────────────────────────────── */
async function sendToAI({ message, history }) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.text || `Server error ${response.status}`);
  }

  const data = await response.json();
  return { text: data.text || "No response from Lexie." };
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function nowTime() {
  if (typeof window === "undefined") return "";
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* ─── Framer variants ────────────────────────────────────────────────────── */
const msgIn = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ════════════════════════════════════════════════════════════════════════════
   Sub-components
════════════════════════════════════════════════════════════════════════════ */

function LCBadge({ size = 32, glow = false }) {
  return (
    <motion.div
      whileHover={{ rotate: [0, 4, -4, 0] }}
      transition={{ duration: 0.4 }}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: glow ? `0 0 22px ${C.primaryGlow}` : undefined,
      }}
    >
      <GlobalOutlined style={{ color: "#fff", fontSize: size * 0.45 }} />
    </motion.div>
  );
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <motion.button
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.9 }}
      onClick={handle}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: C.onSurfaceVar,
        fontSize: 13,
        padding: 4,
        display: "flex",
        alignItems: "center",
      }}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.span
            key="ok"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <CheckOutlined style={{ color: "#4ADE80" }} />
          </motion.span>
        ) : (
          <motion.span
            key="cp"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <CopyOutlined />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function LikeBtn({ liked, onToggle }) {
  return (
    <motion.button
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.85 }}
      onClick={onToggle}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 4,
        display: "flex",
        alignItems: "center",
      }}
    >
      <motion.span
        animate={{
          color: liked ? C.amber700 : C.onSurfaceVar,
          scale: liked ? [1, 1.4, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
        style={{ fontSize: 13 }}
      >
        <StarOutlined style={{ color: liked ? C.amber700 : C.onSurfaceVar }} />
      </motion.span>
    </motion.button>
  );
}

function TypingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{ display: "flex", gap: 10, alignItems: "flex-end" }}
    >
      <LCBadge size={36} />
      <div
        style={{
          background: C.surfaceLowest,
          borderRadius: "18px 18px 18px 4px",
          padding: "12px 18px",
          border: `1px solid ${C.outlineVar}`,
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 12, color: C.onSurfaceVar }}>
          Lexie is thinking…
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          {[0, 0.18, 0.36].map((d, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 0.75, delay: d }}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function ErrorBubble({ error, onRetry }) {
  return (
    <motion.div
      variants={msgIn}
      initial="hidden"
      animate="visible"
      style={{ display: "flex", gap: 10, alignItems: "flex-end" }}
    >
      <LCBadge size={36} />
      <div style={{ maxWidth: "84%" }}>
        <div
          style={{
            background: `${C.error}15`,
            borderLeft: `4px solid ${C.error}`,
            padding: "14px 18px",
            borderRadius: "18px 18px 18px 4px",
            border: `1px solid ${C.error}30`,
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: C.error,
              margin: "0 0 10px",
              lineHeight: 1.6,
            }}
          >
            ⚠️ {error || "Something went wrong. Please try again."}
          </p>
          {onRetry && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={onRetry}
              style={{
                background: `${C.error}20`,
                border: `1px solid ${C.error}40`,
                borderRadius: 8,
                padding: "6px 14px",
                color: C.error,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Retry
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function UserMessage({ msg, onLike }) {
  return (
    <motion.div
      variants={msgIn}
      initial="hidden"
      animate="visible"
      style={{
        display: "flex",
        justifyContent: "flex-end",
        gap: 10,
        alignItems: "flex-end",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 6,
          maxWidth: "72%",
        }}
      >
        <motion.div
          whileHover={{ scale: 1.01 }}
          style={{
            background: `linear-gradient(135deg, ${C.msgUser}, #0A6B62)`,
            color: "#fff",
            padding: "13px 20px",
            borderRadius: "18px 18px 4px 18px",
            boxShadow: `0 6px 24px ${C.primaryGlow}`,
          }}
        >
          <p style={{ fontSize: 14, lineHeight: 1.75, margin: 0 }}>
            {msg.text}
          </p>
        </motion.div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, color: C.onSurfaceVar }}>
            {msg.time}
          </span>
          <CopyBtn text={msg.text} />
          <LikeBtn liked={msg.liked} onToggle={() => onLike(msg.id)} />
        </div>
      </div>
      <Avatar
        size={36}
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRPrzTrcmJT5eSL12gcspLbWpBbIJzNUWQcyCAzd2NM5dCqAKCm1m-j_sK-PkzC6Ongg5ZbkvA-FqyluYfANza-rebmh_ACY8d5Hs5EBach3uKlSgJE3FJbUZSrjR8O3R03PqY-lAPCmg3zNVRJaOEpV2um252x4bHH-8FRjWsj7Ofn0J6WYE6yVLsohIbVCcOC3F07P1ElizqdOSNZWxmLOYhvU89Ut6vYdI13zbBbuMgumFwM0zOtNjJAxqS5MaXdAEvogQYZaM"
        style={{ border: `2px solid ${C.outlineVar}`, flexShrink: 0 }}
      />
    </motion.div>
  );
}

function BotMessage({ msg, onLike }) {
  const rawText = msg.text ?? "";
  return (
    <motion.div
      variants={msgIn}
      initial="hidden"
      animate="visible"
      style={{ display: "flex", gap: 10, alignItems: "flex-end" }}
    >
      <LCBadge size={36} glow />
      <div
        style={{
          maxWidth: "84%",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <motion.div
          whileHover={{ boxShadow: `0 8px 32px ${C.primaryGlow}` }}
          transition={{ duration: 0.2 }}
          style={{
            background: C.surfaceLowest,
            borderLeft: `4px solid ${C.primary}`,
            padding: "16px 20px",
            borderRadius: "18px 18px 18px 4px",
            boxShadow: "0 2px 14px rgba(0,0,0,0.25)",
            border: `1px solid ${C.outlineVar}`,
          }}
        >
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.85,
              color: C.onSurface,
              margin: 0,
              whiteSpace: "pre-line",
            }}
          >
            {rawText}
          </p>
        </motion.div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            paddingLeft: 6,
          }}
        >
          <SafetyCertificateOutlined
            style={{ fontSize: 11, color: C.onSurfaceVar }}
          />
          <span style={{ fontSize: 10, color: C.onSurfaceVar }}>
            Lexie AI • {msg.time}
          </span>
          <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
            <CopyBtn text={rawText} />
            <LikeBtn liked={msg.liked} onToggle={() => onLike(msg.id)} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ onChip }) {
  const suggestions = [
    "Spanish Course",
    "Compare Plans",
    "Grammar Help",
    "Plan Upgrade",
  ];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        gap: 24,
        padding: "40px 20px",
        textAlign: "center",
      }}
    >
      <motion.div
      // animate={{ y: [0, -8, 0] }}
      // transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 24,
            background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: `0 12px 40px ${C.primaryGlow}`,
          }}
        >
          <GlobalOutlined style={{ color: "#fff", fontSize: 38 }} />
        </div>
      </motion.div>
      <div>
        <p
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: C.onSurface,
            margin: "0 0 6px",
            letterSpacing: "-0.5px",
          }}
        >
          Hi i'm <span style={{ color: C.primary }}>Lexie</span>
        </p>
        <p style={{ fontSize: 13, color: C.onSurfaceVar, margin: 0 }}>
          Your AI assistant for Language Chat — ask me anything about courses,
          plans, or support
        </p>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          justifyContent: "center",
          maxWidth: 400,
        }}
      >
        {suggestions.map((s) => (
          <motion.button
            key={s}
            whileHover={{ scale: 1.06, background: C.primary, color: "#fff" }}
            whileTap={{ scale: 0.96 }}
            onClick={() => onChip(s)}
            style={{
              padding: "10px 20px",
              borderRadius: 24,
              border: `1.5px solid ${C.outlineVar}`,
              background: C.surfaceLowest,
              color: C.primary,
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              transition: "background 0.2s, color 0.2s",
            }}
          >
            {s}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

function SessionItem({ s, i, onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.07 }}
      whileHover={{
        x: 3,
        background: s.active ? C.surfaceLowest : C.surfaceHigh,
      }}
      onClick={() => onSelect && onSelect(s)}
      style={{
        padding: "11px 14px",
        borderRadius: 12,
        cursor: "pointer",
        marginBottom: 4,
        borderLeft: s.active
          ? `4px solid ${C.primary}`
          : "4px solid transparent",
        background: s.active ? C.surfaceLowest : "transparent",
        boxShadow: s.active ? `0 2px 12px ${C.primaryGlow}` : "none",
        transition: "background 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 4,
        }}
      >
        <MessageOutlined
          style={{ fontSize: 12, color: s.active ? C.primary : C.onSurfaceVar }}
        />
        <p
          style={{
            fontSize: 12,
            fontWeight: s.active ? 700 : 500,
            color: C.onSurface,
            margin: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            flex: 1,
          }}
        >
          {s.title}
        </p>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: 10, color: C.onSurfaceVar }}>{s.time}</span>
        <Tag
          style={{
            fontSize: 9,
            padding: "1px 6px",
            borderRadius: 6,
            border: "none",
            background: s.active ? `${C.primary}20` : C.surfaceHighest,
            color: s.active ? C.primary : C.onSurfaceVar,
            margin: 0,
          }}
        >
          {s.tag}
        </Tag>
      </div>
    </motion.div>
  );
}

function SidebarContent({
  onNewChat,
  onClose,
  sessions = [],
  onSelectSession,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: C.surfaceLow,
      }}
    >
      <div
        style={{
          padding: "20px 20px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LCBadge size={36} glow />
          <div>
            <h1
              style={{
                fontWeight: 900,
                fontSize: 18,
                color: C.onSurface,
                margin: 0,
                lineHeight: 1,
                letterSpacing: "-0.5px",
              }}
            >
              Language<span style={{ color: C.primary }}>Chat</span>
            </h1>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginTop: 4,
              }}
            >
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                style={{
                  width: 7,
                  height: 7,
                  background: "#4ADE80",
                  borderRadius: "50%",
                  display: "inline-block",
                }}
              />
              <span
                style={{ fontSize: 10, color: C.onSurfaceVar, fontWeight: 600 }}
              >
                Online now
              </span>
            </div>
          </div>
        </div>
        {onClose && (
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            style={{ color: C.onSurfaceVar }}
          />
        )}
      </div>
      <div style={{ padding: "0 16px 18px" }}>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Button
            onClick={() => {
              onNewChat();
              onClose?.();
            }}
            type="primary"
            icon={<PlusOutlined />}
            block
            style={{
              background: `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
              border: "none",
              borderRadius: 12,
              height: 44,
              fontWeight: 700,
              fontSize: 13,
              boxShadow: `0 4px 16px ${C.primaryGlow}`,
              color: "#fff",
            }}
          >
            New Conversation
          </Button>
        </motion.div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "0 10px" }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: C.onSurfaceVar,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "0 8px 10px",
          }}
        >
          Recent Sessions
        </p>
        {sessions.length === 0 && (
          <p
            style={{
              fontSize: 11,
              color: C.onSurfaceVar,
              padding: "0 8px",
              fontStyle: "italic",
            }}
          >
            No sessions yet. Start a conversation!
          </p>
        )}
        {sessions.map((s, i) => (
          <SessionItem
            key={s.id}
            s={s}
            i={i}
            onSelect={(sess) => {
              onSelectSession?.(sess);
              onClose?.();
            }}
          />
        ))}
      </div>
      <div
        style={{
          padding: 16,
          borderTop: `1px solid ${C.outlineVar}`,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Badge dot status="success" offset={[-3, 34]}>
          <Avatar
            size={40}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDc8of4_SCOehjcNnKPF0RtdIe1MXvlTJXsXtgVK5hFsqQdJL2Q9dwcwH9QlQG2_cJZqfchynkT-EqmjecEJbdZlj00dTwLoP1UBxQe6O_Y9SJ_ZtZdnGYEicKR4dRqApU4U9Q_s1ZFuU16XgVLJwjgtQ30uL7iIvy9LkYKRz6E_fcccnfU4Oi8SPn62WA-yHJG_AtDOjkM5FP5nttr8I15RdpAyLKHyVw9F8XHyvly8rn6N9OJ1IfsUQl7RjYiFQ233pVyJjd038s"
            style={{ border: `2px solid ${C.outlineVar}` }}
          />
        </Badge>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.onSurface,
              margin: 0,
            }}
          >
            Alex Morgan
          </p>
          <p style={{ fontSize: 10, color: C.onSurfaceVar, margin: 0 }}>
            Sales Advisor — Cairo
          </p>
        </div>
        <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.3 }}>
          <Button
            type="text"
            icon={<SettingOutlined />}
            style={{ color: C.onSurfaceVar }}
          />
        </motion.div>
      </div>
    </div>
  );
}

function ContextPanelContent({ lastTip, onClose }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: 20,
        overflowY: "auto",
        background: C.surfaceLow,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 18,
        }}
      >
        <h3
          style={{
            fontSize: 12,
            fontWeight: 900,
            color: C.onSurface,
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <InfoCircleOutlined style={{ color: C.primary, fontSize: 14 }} />{" "}
          Current Context
        </h3>
        {onClose && (
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            style={{ color: C.onSurfaceVar }}
          />
        )}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        style={{
          background: C.surfaceLowest,
          borderRadius: 14,
          padding: 16,
          marginBottom: 22,
          border: `1px solid ${C.primary}20`,
          boxShadow: `0 2px 16px ${C.primaryGlow}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: C.primary,
            }}
          />
          <h4
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: C.onSurface,
              margin: 0,
            }}
          >
            Featured Plan
          </h4>
        </div>
        <div
          style={{
            background: `${C.primary}0A`,
            padding: 12,
            borderRadius: 10,
            border: `1px solid ${C.primary}15`,
          }}
        >
          <p
            style={{
              fontSize: 12,
              fontWeight: 800,
              color: C.primary,
              margin: "0 0 8px",
            }}
          >
            Pro — $29/mo
          </p>
          <ul
            style={{
              fontSize: 10,
              color: C.onSurfaceVar,
              margin: 0,
              padding: 0,
              listStyle: "none",
              lineHeight: 2,
            }}
          >
            {[
              ["Lessons", "5/week live sessions"],
              ["Vocabulary", "500+ flashcards"],
              ["Tutoring", "2 hrs/month free"],
            ].map(([k, v]) => (
              <li
                key={k}
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <span>• {k}</span>
                <span style={{ fontWeight: 600, color: C.primary }}>{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.14 }}
        style={{ marginBottom: 22 }}
      >
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: C.onSurfaceVar,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: 10,
          }}
        >
          Quick Compare
        </p>
        {[
          { name: "Starter Plan", price: "$19/mo" },
          { name: "Elite Plan", price: "$49/mo" },
        ].map((c, i) => (
          <motion.div
            key={i}
            whileHover={{ x: 4, background: `${C.primary}10` }}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              background: `${C.surfaceHighest}60`,
              borderRadius: 12,
              cursor: "pointer",
              marginBottom: 8,
              transition: "background 0.2s",
              border: `1px solid ${C.outlineVar}`,
            }}
          >
            <span style={{ fontSize: 12, color: C.onSurface, fontWeight: 500 }}>
              {c.name}
            </span>
            <span style={{ fontSize: 11, fontWeight: 800, color: C.primary }}>
              {c.price}
            </span>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 22,
        }}
      >
        {SIDE_ACTIONS.map((a, i) => (
          <motion.div key={i} whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}>
            <Button
              block
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderRadius: 12,
                border: `1px solid ${C.outlineVar}`,
                background: C.surfaceLowest,
                color: C.onSurface,
                fontWeight: 700,
                fontSize: 12,
                height: 44,
                boxShadow: "0 1px 6px rgba(0,0,0,0.15)",
              }}
            >
              <span>{a.label}</span>
              <span style={{ color: C.primary }}>{a.icon}</span>
            </Button>
          </motion.div>
        ))}
      </motion.div>
      <div style={{ marginTop: "auto" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={lastTip}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              background: C.amber50,
              border: `1.5px solid ${C.amber200}`,
              borderRadius: 14,
              padding: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <motion.span
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ repeat: Infinity, duration: 3, delay: 1 }}
              >
                <BulbOutlined style={{ color: C.amber700, fontSize: 16 }} />
              </motion.span>
              <h4
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: C.amber700,
                  margin: 0,
                }}
              >
                Sales Tip
              </h4>
            </div>
            <p
              style={{
                fontSize: 11,
                lineHeight: 1.7,
                color: C.amber900,
                fontWeight: 500,
                margin: 0,
              }}
            >
              {lastTip ||
                "Ask open-ended questions to understand what motivates the learner before recommending a plan."}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function InputArea({ onSend, isLoading }) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const send = useCallback(() => {
    const t = input.trim();
    if (!t || isLoading) return;
    onSend(t);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [input, isLoading, onSend]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      style={{
        padding: "14px 20px 18px",
        background: `${C.surfaceLowest}F0`,
        borderTop: `1px solid ${C.outlineVar}`,
        backdropFilter: "blur(12px)",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 12,
          overflowX: "auto",
          paddingBottom: 2,
          scrollbarWidth: "none",
        }}
      >
        {CHIPS.map((chip) => (
          <motion.button
            key={chip}
            whileHover={{ scale: 1.06, background: C.primary, color: "#fff" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setInput(chip);
              inputRef.current?.focus();
            }}
            style={{
              padding: "7px 16px",
              borderRadius: 20,
              background: C.surfaceLow,
              border: `1px solid ${C.outlineVar}`,
              fontWeight: 700,
              fontSize: 11,
              color: C.primary,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "background 0.2s, color 0.2s",
            }}
          >
            {chip}
          </motion.button>
        ))}
      </div>
      <motion.div
        animate={{
          boxShadow: focused
            ? `0 0 0 2.5px ${C.primary}35, 0 4px 20px ${C.primaryGlow}`
            : "0 2px 10px rgba(0,0,0,0.2)",
        }}
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          background: C.surfaceLow,
          borderRadius: 18,
          padding: "6px 6px 6px 16px",
          border: `1.5px solid ${focused ? C.primary : C.outlineVar}`,
          transition: "border-color 0.2s",
        }}
      >
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
          <Tooltip title="Attach file">
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: C.onSurfaceVar,
                fontSize: 16,
                display: "flex",
                padding: 4,
              }}
            >
              <PaperClipOutlined />
            </motion.button>
          </Tooltip>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            disabled={isLoading}
            placeholder="Ask Lexie about any course, plan, or support topic…"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 14,
              color: C.onSurface,
              opacity: isLoading ? 0.5 : 1,
            }}
          />
          <Tooltip title="Voice input">
            <motion.button
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: C.onSurfaceVar,
                fontSize: 16,
                display: "flex",
                padding: 4,
              }}
            >
              <AudioOutlined />
            </motion.button>
          </Tooltip>
        </div>
        <motion.button
          onClick={send}
          disabled={isLoading || !input.trim()}
          whileHover={{ scale: isLoading || !input.trim() ? 1 : 1.08 }}
          whileTap={{ scale: isLoading || !input.trim() ? 1 : 0.92 }}
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            border: "none",
            cursor: input.trim() && !isLoading ? "pointer" : "not-allowed",
            background:
              input.trim() && !isLoading
                ? `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`
                : C.surfaceHigh,
            color: input.trim() && !isLoading ? "#fff" : C.onSurfaceVar,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 17,
            boxShadow:
              input.trim() && !isLoading
                ? `0 4px 16px ${C.primaryGlow}`
                : "none",
            transition: "background 0.2s, box-shadow 0.2s, color 0.2s",
            flexShrink: 0,
          }}
        >
          <SendOutlined />
        </motion.button>
      </motion.div>
      <p
        style={{
          textAlign: "center",
          fontSize: 10,
          color: C.onSurfaceVar,
          marginTop: 10,
          marginBottom: 0,
          opacity: 0.6,
        }}
      >
        Lexie may make mistakes. Always verify final actions in the official CRM
        system.
      </p>
    </motion.div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   Root
════════════════════════════════════════════════════════════════════════════ */
function LanguageChatInner() {
  const [messages, setMessages] = useState([]);
  const [sessions, setSessions] = useState(() => {
    if (typeof window === "undefined") return [];
    return loadSessions();
  });
  const [lastTip, setLastTip] = useState(
    "Ask open-ended questions to understand what motivates the learner before recommending a plan.",
  );
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const idRef = useRef(100);
  const sessionIdRef = useRef(null);

  useEffect(() => {
    sessionIdRef.current = Date.now();
  }, []);
  const isFirstMessageRef = useRef(true);

  const bottomRef = useRef(null);
  const { isMobile, isTablet } = useBreakpoint();
  const showLeftInline = !isMobile && !isTablet;
  const showRightInline = !isMobile && !isTablet;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const buildHistory = (msgs) =>
    msgs
      .filter((m) => m.role !== "error")
      .map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));

  const mutation = useMutation({
    mutationFn: ({ message, history }) => sendToAI({ message, history }),
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: idRef.current++,
          role: "bot",
          text: data.text,
          time: nowTime(),
          liked: false,
        },
      ]);
    },
    onError: (err) => {
      setMessages((prev) => [
        ...prev,
        {
          id: idRef.current++,
          role: "error",
          text: err?.message || "Failed to reach Lexie. Please try again.",
          time: nowTime(),
        },
      ]);
    },
  });

  const handleSend = useCallback(
    (text) => {
      if (mutation.isPending) return;

      const userMsg = {
        id: idRef.current++,
        role: "user",
        text,
        time: nowTime(),
        liked: false,
      };

      const history = buildHistory(messages.filter((m) => m.role !== "error"));
      setMessages((prev) => [...prev, userMsg]);
      mutation.mutate({ message: text, history });

      // Persist session on the very first user message
      if (isFirstMessageRef.current) {
        isFirstMessageRef.current = false;
        const newSession = makeSession(sessionIdRef.current, text);
        const existing = loadSessions().filter(
          (s) => s.id !== sessionIdRef.current,
        );
        const updated = [
          newSession,
          ...existing.map((s) => ({ ...s, active: false })),
        ].slice(0, MAX_SESSIONS);
        saveSessions(updated);
        setSessions(updated);
      }
    },
    [mutation, messages],
  );

  const handleRetry = useCallback(() => {
    setMessages((prev) => {
      const withoutError = prev.filter((m) => m.role !== "error");
      const lastUser = [...withoutError]
        .reverse()
        .find((m) => m.role === "user");
      if (!lastUser) return prev;
      const history = buildHistory(
        withoutError.slice(0, withoutError.indexOf(lastUser)),
      );
      mutation.mutate({ message: lastUser.text, history });
      return withoutError;
    });
  }, [mutation]);

  const toggleLike = useCallback((id) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, liked: !m.liked } : m)),
    );
  }, []);

  const handleNewChat = () => {
    setMessages([]);
    mutation.reset();
    sessionIdRef.current = Date.now();
    isFirstMessageRef.current = true;
    // Mark all sessions inactive
    setSessions((prev) => {
      const updated = prev.map((s) => ({ ...s, active: false }));
      saveSessions(updated);
      return updated;
    });
  };

  // Clicking a session in the sidebar marks it active (UI only — messages not restored in this version)
  const handleSelectSession = useCallback((sess) => {
    setSessions((prev) => {
      const updated = prev.map((s) => ({ ...s, active: s.id === sess.id }));
      saveSessions(updated);
      return updated;
    });
  }, []);

  const isLoading = mutation.isPending;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { height: 100%; font-family: 'Sora', sans-serif; background: ${C.surface}; color: ${C.onSurface}; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.outlineVar}; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: ${C.primary}60; }
        input::placeholder { color: ${C.onSurfaceVar}70; font-family: 'Sora', sans-serif; }
        .ant-drawer-body { padding: 0 !important; }
        .ant-btn { font-family: 'Sora', sans-serif !important; }
        .ant-tag { font-family: 'Sora', sans-serif !important; }
      `}</style>

      {!showLeftInline && (
        <Drawer
          open={leftOpen}
          onClose={() => setLeftOpen(false)}
          placement="left"
          size={270}
          closable={false}
          styles={{ body: { padding: 0, background: C.surfaceLow } }}
        >
          <SidebarContent
            sessions={sessions}
            onNewChat={handleNewChat}
            onClose={() => setLeftOpen(false)}
            onSelectSession={handleSelectSession}
          />
        </Drawer>
      )}

      <div
        style={{
          display: "flex",
          height: "100vh",
          width: "100%",
          overflow: "hidden",
          fontFamily: "'Sora', sans-serif",
          background: C.surface,
        }}
      >
        {showLeftInline && (
          <motion.aside
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              position: "relative",
              zIndex: 2,
              width: 272,
              flexShrink: 0,
              background: C.surfaceLow,
              display: "flex",
              flexDirection: "column",
              borderRight: `1px solid ${C.outlineVar}`,
              height: "100vh",
              boxShadow: `4px 0 24px rgba(0,0,0,0.3)`,
            }}
          >
            <SidebarContent
              sessions={sessions}
              onNewChat={handleNewChat}
              onSelectSession={handleSelectSession}
            />
          </motion.aside>
        )}

        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: C.surface,
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <motion.header
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 20px",
              background: `${C.surfaceLowest}E8`,
              backdropFilter: "blur(16px)",
              borderBottom: `1px solid ${C.outlineVar}`,
              flexShrink: 0,
              boxShadow: "0 1px 16px rgba(0,0,0,0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {!showLeftInline && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setLeftOpen(true)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: C.primary,
                    fontSize: 20,
                    display: "flex",
                  }}
                >
                  <MenuOutlined />
                </motion.button>
              )}
              <LCBadge size={28} />
              <div>
                <h2
                  style={{
                    fontWeight: 800,
                    color: C.onSurface,
                    margin: 0,
                    fontSize: isMobile ? 13 : 15,
                    lineHeight: 1.2,
                    letterSpacing: "-0.3px",
                  }}
                >
                  Language<span style={{ color: C.primary }}>Chat</span>
                </h2>
                {!isMobile && (
                  <p style={{ fontSize: 10, color: C.onSurfaceVar, margin: 0 }}>
                    {messages.filter((m) => m.role !== "error").length} messages
                  </p>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
              {isLoading && (
                <motion.div
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  style={{
                    fontSize: 10,
                    color: C.primary,
                    fontWeight: 700,
                    marginRight: 8,
                  }}
                >
                  AI thinking…
                </motion.div>
              )}
              <Tooltip title="Export">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: C.onSurfaceVar,
                    fontSize: 18,
                    display: "flex",
                    padding: 6,
                  }}
                >
                  <ShareAltOutlined />
                </motion.button>
              </Tooltip>
              {!showRightInline && (
                <Tooltip title="Context">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setRightOpen(true)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: C.primary,
                      fontSize: 18,
                      display: "flex",
                      padding: 6,
                    }}
                  >
                    <InfoCircleOutlined />
                  </motion.button>
                </Tooltip>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: C.onSurfaceVar,
                  fontSize: 18,
                  display: "flex",
                  padding: 6,
                }}
              >
                <MoreOutlined />
              </motion.button>
            </div>
          </motion.header>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: isMobile ? "20px 14px" : "28px 28px",
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            {messages.length === 0 && !isLoading ? (
              <EmptyState onChip={(t) => handleSend(t)} />
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg) =>
                  msg.role === "user" ? (
                    <UserMessage key={msg.id} msg={msg} onLike={toggleLike} />
                  ) : msg.role === "error" ? (
                    <ErrorBubble
                      key={msg.id}
                      error={msg.text}
                      onRetry={handleRetry}
                    />
                  ) : (
                    <BotMessage key={msg.id} msg={msg} onLike={toggleLike} />
                  ),
                )}
                {isLoading && <TypingBubble key="typing" />}
              </AnimatePresence>
            )}
            <div ref={bottomRef} />
          </div>

          <InputArea onSend={handleSend} isLoading={isLoading} />
        </main>
      </div>
    </>
  );
}

export default function LanguageChat() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageChatInner />
    </QueryClientProvider>
  );
}
