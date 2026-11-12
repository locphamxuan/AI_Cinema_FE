'use client';

import { useEffect, useRef, useState } from 'react';
import { supportService } from '@/services/supportService';
import { useAppStore } from '@/store/useAppStore';
import type { SupportConversation, SupportMessage, SupportQuickReply } from '@/types/support';

export function useAiSupportChat(isOpen: boolean) {
  const { isAuthenticated, user } = useAppStore();
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [quickReplies, setQuickReplies] = useState<SupportQuickReply[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const startRes = await supportService.startOrGetOpen();
        if (!active || !startRes.success || !startRes.data) {
          if (active) setErrorMsg(startRes.message || 'Không thể kết nối Trợ lý AI lúc này.');
          return;
        }
        setConversation(startRes.data);
        const detailRes = await supportService.getDetail(startRes.data.id);
        if (active && detailRes.success && detailRes.data) {
          setConversation(detailRes.data.conversation);
          setMessages(detailRes.data.messages);
          setQuickReplies(detailRes.data.quickReplies ?? []);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView?.({ behavior: 'smooth' });
  }, [messages.length, sending]);

  const startNewConversation = async () => {
    if (loading || sending) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const freshRes = await supportService.startFresh(conversation?.id);
      if (freshRes.success && freshRes.data) {
        setConversation(freshRes.data);
        const detailRes = await supportService.getDetail(freshRes.data.id);
        if (detailRes.success && detailRes.data) {
          setConversation(detailRes.data.conversation);
          setMessages(detailRes.data.messages);
          setQuickReplies(detailRes.data.quickReplies ?? []);
        }
      } else {
        setErrorMsg(freshRes.message || 'Chưa tạo được cuộc hội thoại mới.');
      }
    } finally {
      setLoading(false);
    }
  };

  const sendText = async (textToSend: string) => {
    const clean = textToSend.trim();
    if (!clean || sending || loading) return;
    const convId = conversation?.id ?? 'local-fe-ai-support';
    setDraft('');
    setErrorMsg(null);
    setSending(true);
    try {
      const res = await supportService.sendMessage(convId, clean, `fe-${Date.now()}`);
      if (res.success && res.data) {
        setConversation(res.data.conversation);
        setMessages((prev) => {
          const next = [...prev, res.data.memberMessage];
          if (res.data.aiMessage) next.push(res.data.aiMessage);
          if (res.data.systemMessage) next.push(res.data.systemMessage);
          return next;
        });
        if (res.data.quickReplies?.length) setQuickReplies(res.data.quickReplies);
      } else {
        setDraft(clean);
        setErrorMsg(res.message || 'Không gửi được tin nhắn. Hãy bấm "Hội thoại mới".');
      }
    } finally {
      setSending(false);
    }
  };

  const requestStaff = async () => {
    if (!conversation || sending || loading) return;
    setErrorMsg(null);
    setSending(true);
    try {
      const res = await supportService.requestStaff(conversation.id);
      if (res.success && res.data) {
        setConversation(res.data);
        const detailRes = await supportService.getDetail(conversation.id);
        if (detailRes.success && detailRes.data) setMessages(detailRes.data.messages);
      }
    } finally {
      setSending(false);
    }
  };

  const confirmResolved = async () => {
    if (!conversation || sending || loading) return;
    setErrorMsg(null);
    setSending(true);
    try {
      const res = await supportService.confirmResolved(conversation.id, 5);
      if (res.success && res.data) {
        setConversation(res.data);
        const detailRes = await supportService.getDetail(conversation.id);
        if (detailRes.success && detailRes.data) setMessages(detailRes.data.messages);
      }
    } finally {
      setSending(false);
    }
  };

  return {
    isAuthenticated,
    user,
    conversation,
    messages,
    quickReplies,
    draft,
    setDraft,
    loading,
    sending,
    errorMsg,
    messagesEndRef,
    startNewConversation,
    sendText,
    requestStaff,
    confirmResolved,
  };
}
