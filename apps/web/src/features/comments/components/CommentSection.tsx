// src/features/comments/components/CommentSection.tsx
import { useState, useEffect } from "react";
import { Send, ThumbsUp, Heart, Laugh, Edit2, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import toast from "react-hot-toast";
import api from "../../../lib/axios";
import { useAppSelector } from "../../../store/hooks";
import { getSocket } from "../../../lib/socket";
import { SOCKET_EVENTS } from "../../../constants/socket.constants";

interface CommentSectionProps {
  taskId: string;
}

const REACTIONS = ["👍", "❤️", "😄", "🎉", "🔥", "👀"];

const CommentSection = ({ taskId }: CommentSectionProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [showReactions, setShowReactions] = useState<string | null>(null);

  useEffect(() => {
    loadComments();

    const socket = getSocket();
    if (socket) {
      socket.emit(SOCKET_EVENTS.JOIN_TASK, taskId);
      socket.on(SOCKET_EVENTS.COMMENT_ADDED, ({ comment }: any) => {
        setComments((prev) => [...prev, comment]);
      });
      socket.on(SOCKET_EVENTS.COMMENT_UPDATED, ({ comment }: any) => {
        setComments((prev) =>
          prev.map((c) => (c._id === comment._id ? comment : c))
        );
      });
      socket.on(SOCKET_EVENTS.COMMENT_DELETED, ({ commentId }: any) => {
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      });
    }

    return () => {
      const socket = getSocket();
      if (socket) {
        socket.emit(SOCKET_EVENTS.LEAVE_TASK, taskId);
        socket.off(SOCKET_EVENTS.COMMENT_ADDED);
        socket.off(SOCKET_EVENTS.COMMENT_UPDATED);
        socket.off(SOCKET_EVENTS.COMMENT_DELETED);
      }
    };
  }, [taskId]);

  const loadComments = async () => {
    try {
      const { data } = await api.get(`/tasks/${taskId}/comments`);
      setComments(data.data.comments);
    } catch {
      console.error("Failed to load comments");
    }
  };

  const submitComment = async () => {
    if (!content.trim()) return;
    try {
      setIsLoading(true);
      await api.post(`/tasks/${taskId}/comments`, { content: content.trim() });
      setContent("");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const updateComment = async (commentId: string) => {
    if (!editContent.trim()) return;
    try {
      const { data } = await api.patch(`/comments/${commentId}`, {
        content: editContent.trim(),
      });
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? data.data.comment : c))
      );
      setEditingId(null);
      toast.success("Comment updated");
    } catch {
      toast.error("Failed to update comment");
    }
  };

  const addReaction = async (commentId: string, emoji: string) => {
    try {
      const { data } = await api.post(`/comments/${commentId}/reactions`, { emoji });
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? data.data.comment : c))
      );
      setShowReactions(null);
    } catch {
      toast.error("Failed to add reaction");
    }
  };

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Comment Input */}
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-white">
            {user?.name?.charAt(0)}
          </span>
        </div>
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                submitComment();
              }
            }}
            placeholder="Write a comment... (Ctrl+Enter to send)"
            rows={3}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={submitComment}
              disabled={!content.trim() || isLoading}
              className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Comment
            </button>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className="flex gap-3 group">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 overflow-hidden">
                {comment.author?.avatar ? (
                  <img
                    src={comment.author.avatar}
                    className="w-full h-full object-cover"
                    alt={comment.author.name}
                  />
                ) : (
                  <span className="text-xs font-bold text-white">
                    {comment.author?.name?.charAt(0)}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-slate-900 dark:text-white">
                      {comment.author?.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">
                        {getTimeAgo(comment.createdAt)}
                        {comment.isEdited && (
                          <span className="ml-1 text-slate-300">(edited)</span>
                        )}
                      </span>
                      {comment.author?._id === user?._id && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingId(comment._id);
                              setEditContent(comment.content);
                            }}
                            className="p-1 hover:text-indigo-600 text-slate-400 transition-colors"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteComment(comment._id)}
                            className="p-1 hover:text-red-600 text-slate-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {editingId === comment._id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateComment(comment._id)}
                          className="text-xs px-3 py-1 bg-indigo-600 text-white rounded-lg"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-600 dark:text-slate-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>

                {/* Reactions */}
                <div className="flex items-center gap-2 mt-1.5 px-1">
                  {comment.reactions?.map((reaction: any) => (
                    <button
                      key={reaction.emoji}
                      onClick={() => addReaction(comment._id, reaction.emoji)}
                      className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span>{reaction.emoji}</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {reaction.users?.length}
                      </span>
                    </button>
                  ))}

                  {/* Add Reaction */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowReactions(
                          showReactions === comment._id ? null : comment._id
                        )
                      }
                      className="opacity-0 group-hover:opacity-100 px-2 py-0.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all"
                    >
                      + React
                    </button>
                    {showReactions === comment._id && (
                      <div className="absolute bottom-6 left-0 flex gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 shadow-xl z-20">
                        {REACTIONS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => addReaction(comment._id, emoji)}
                            className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-base transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;