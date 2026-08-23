"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { io, type Socket } from "socket.io-client";
import { Send, ImageIcon, MessageCircle, ArrowLeft } from "lucide-react";

import { useUIStore } from "@/store/ui-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ChatRoom {
  id: string;
  product: { id: string; title: string; imageUrl: string | null };
  buyer: { id: string; name: string };
  seller: { id: string; name: string };
  messages: { content: string; createdAt: string }[];
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: { id: string; name: string };
}

export default function ChatPage() {
  const { locale } = useUIStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomIdFromUrl = searchParams.get("room");

  const [rooms, setRooms] = React.useState<ChatRoom[]>([]);
  const [loadingRooms, setLoadingRooms] = React.useState(true);
  const [activeRoomId, setActiveRoomId] = React.useState<string | null>(
    roomIdFromUrl,
  );
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [showRoomListMobile, setShowRoomListMobile] =
    React.useState(!roomIdFromUrl);

  const socketRef = React.useRef<Socket | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  function authHeaders() {
    const token = localStorage.getItem("farmiq_access_token");
    return { Authorization: `Bearer ${token}` };
  }

  // Auth check + get current user id
  React.useEffect(() => {
    const token = localStorage.getItem("farmiq_access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    const raw = localStorage.getItem("farmiq_user");
    if (raw) {
      try {
        setCurrentUserId(JSON.parse(raw).id);
      } catch {
        setCurrentUserId(null);
      }
    }
  }, [router]);

  // Load room list
  React.useEffect(() => {
    async function loadRooms() {
      setLoadingRooms(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/chat/rooms`,
          {
            headers: authHeaders(),
          },
        );
        const result = await res.json();
        setRooms(result?.data ?? []);
      } catch {
        setRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    }
    loadRooms();
  }, []);

  // Connect socket once
  React.useEffect(() => {
    const token = localStorage.getItem("farmiq_access_token");
    if (!token) return;

    const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}/chat`, {
      auth: { token },
    });
    socketRef.current = socket;

    socket.on("newMessage", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("error", (err: { message: string }) => {
      console.error("Chat socket error:", err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Join room + load history when active room changes
  React.useEffect(() => {
    if (!activeRoomId) return;

    setLoadingMessages(true);
    socketRef.current?.emit("joinRoom", { roomId: activeRoomId });

    async function loadMessages() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/chat/rooms/${activeRoomId}/messages`,
          { headers: authHeaders() },
        );
        const result = await res.json();
        setMessages(result?.data ?? []);
      } catch {
        setMessages([]);
      } finally {
        setLoadingMessages(false);
      }
    }
    loadMessages();
  }, [activeRoomId]);

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSelectRoom(roomId: string) {
    setActiveRoomId(roomId);
    setShowRoomListMobile(false);
    router.replace(`/chat?room=${roomId}`);
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !activeRoomId) return;
    socketRef.current?.emit("sendMessage", {
      roomId: activeRoomId,
      content: input.trim(),
    });
    setInput("");
  }

  const activeRoom = rooms.find((r) => r.id === activeRoomId);
  const otherParticipant =
    activeRoom && currentUserId
      ? activeRoom.buyer.id === currentUserId
        ? activeRoom.seller
        : activeRoom.buyer
      : null;

  return (
    <div className="mx-auto flex h-[calc(100vh-76px)] max-w-[1100px]">
      {/* Room list */}
      <div
        className={`w-full shrink-0 border-r border-border bg-surface sm:w-[300px] ${
          showRoomListMobile ? "block" : "hidden sm:block"
        }`}
      >
        <div className="border-b border-border p-4">
          <h2 className="font-bangla text-lg font-bold">
            {locale === "bn" ? "বার্তা" : "Messages"}
          </h2>
        </div>
        <div className="overflow-y-auto">
          {loadingRooms ? (
            <div className="space-y-2 p-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-lg bg-muted"
                />
              ))}
            </div>
          ) : rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageCircle className="h-8 w-8 text-muted-foreground" />
              <p className="mt-2 font-bangla text-sm text-muted-foreground">
                {locale === "bn" ? "কোনো কথোপকথন নেই" : "No conversations yet"}
              </p>
            </div>
          ) : (
            rooms.map((room) => {
              const other =
                currentUserId && room.buyer.id === currentUserId
                  ? room.seller
                  : room.buyer;
              const lastMsg = room.messages[0];
              return (
                <button
                  key={room.id}
                  onClick={() => handleSelectRoom(room.id)}
                  className={`flex w-full items-center gap-3 border-b border-border p-3 text-left hover:bg-muted ${
                    activeRoomId === room.id ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
                    {room.product.imageUrl ? (
                      <Image
                        src={room.product.imageUrl}
                        alt={room.product.title}
                        fill
                        className="rounded-lg object-cover"
                      />
                    ) : (
                      <ImageIcon className="h-5 w-5 text-muted-foreground/40" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-bangla text-sm font-semibold">
                      {other.name}
                    </div>
                    <div className="truncate font-bangla text-xs text-muted-foreground">
                      {room.product.title}
                    </div>
                    {lastMsg && (
                      <div className="mt-0.5 truncate font-bangla text-xs text-muted-foreground">
                        {lastMsg.content}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Conversation */}
      <div
        className={`flex flex-1 flex-col ${
          showRoomListMobile ? "hidden sm:flex" : "flex"
        }`}
      >
        {!activeRoomId ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <MessageCircle className="h-10 w-10 text-muted-foreground" />
            <p className="mt-3 font-bangla text-[15px] text-muted-foreground">
              {locale === "bn"
                ? "কথা বলা শুরু করতে একটা কথোপকথন বাছাই করুন"
                : "Select a conversation to start chatting"}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border p-4">
              <button
                onClick={() => setShowRoomListMobile(true)}
                className="text-muted-foreground sm:hidden"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="font-bangla text-sm font-semibold">
                  {otherParticipant?.name}
                </div>
                <div className="font-bangla text-xs text-muted-foreground">
                  {activeRoom?.product.title}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {loadingMessages ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-10 w-2/3 animate-pulse rounded-xl bg-muted"
                    />
                  ))}
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender.id === currentUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2.5 font-bangla text-sm ${
                          isMine
                            ? "bg-primary text-white"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 border-t border-border p-4"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  locale === "bn" ? "মেসেজ লিখুন..." : "Type a message..."
                }
                className="font-bangla"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim()}
                className="shrink-0 bg-primary text-white hover:bg-primary-hover"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
