import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Heart, MessageCircle, MoreHorizontal, Send, X } from "lucide-react-native";
import { Keyboard, Pressable, StyleSheet, Text, View } from "react-native";
import React, { useEffect } from "react";
import { router } from "expo-router";

import { BottomSheet, useBottomSheetNavigation } from "@niibase/bottom-sheet-manager";

type Comment = {
  id: string;
  user: string;
  avatar: string;
  text: string;
  likes: number;
  time: string;
  liked: boolean;
};

const COMMENTS: Comment[] = [
  {
    id: "1",
    user: "Sarah Johnson",
    avatar: "SJ",
    text: "This is absolutely amazing! Love the smooth animations 🔥",
    likes: 42,
    time: "2h",
    liked: false,
  },
  {
    id: "2",
    user: "Mike Chen",
    avatar: "MC",
    text: "The iOS modal style is so clean. Great work on the implementation!",
    likes: 28,
    time: "3h",
    liked: true,
  },
  {
    id: "3",
    user: "Emily Davis",
    avatar: "ED",
    text: "Can't wait to use this in my next project. The stack behaviors are exactly what I needed.",
    likes: 15,
    time: "5h",
    liked: false,
  },
  {
    id: "4",
    user: "Alex Thompson",
    avatar: "AT",
    text: "Expand to full screen and watch the background animate! 🎬",
    likes: 89,
    time: "6h",
    liked: true,
  },
  {
    id: "5",
    user: "Jordan Lee",
    avatar: "JL",
    text: "The attention to detail here is incredible. Every transition feels native.",
    likes: 34,
    time: "8h",
    liked: false,
  },
  {
    id: "6",
    user: "Casey Williams",
    avatar: "CW",
    text: "Just shipped an app using this library. Our users love the bottom sheet experience!",
    likes: 67,
    time: "12h",
    liked: false,
  },
];

export default function CommentsSheet() {
  const navigation = useBottomSheetNavigation();
  const height = useSharedValue(68);

  useEffect(() => {
    const sub = navigation.addListener("sheetOnAnimate", ({ data: { toIndex } }) => {
      height.set(
        withTiming(interpolate(toIndex, [0, 1], [68, 100], "clamp"), { duration: 150 }),
      );
    });

    return () => {
      navigation.removeListener("sheetOnAnimate", sub);
    };
  }, [navigation]);

  const [comments, setComments] = React.useState(COMMENTS);
  const [newComment, setNewComment] = React.useState("");

  const toggleLike = (id: string) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
          : c,
      ),
    );
  };

  const addComment = () => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      user: "You",
      avatar: "YO",
      text: newComment.trim(),
      likes: 0,
      time: "now",
      liked: false,
    };

    setComments((prev) => [comment, ...prev]);
    setNewComment("");
    Keyboard.dismiss();
  };

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentAvatar}>
        <Text style={styles.commentAvatarText}>{item.avatar}</Text>
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUser}>{item.user}</Text>
          <Text style={styles.commentTime}>{item.time}</Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
        <View style={styles.commentActions}>
          <Pressable style={styles.commentAction} onPress={() => toggleLike(item.id)}>
            <Heart
              size={16}
              color={item.liked ? "#EF4444" : "#94A3B8"}
              fill={item.liked ? "#EF4444" : "transparent"}
            />
            <Text
              style={[
                styles.commentActionText,
                item.liked && styles.commentActionTextActive,
              ]}
            >
              {item.likes}
            </Text>
          </Pressable>
          <Pressable style={styles.commentAction}>
            <MessageCircle size={16} color="#94A3B8" />
            <Text style={styles.commentActionText}>Reply</Text>
          </Pressable>
        </View>
      </View>
      <Pressable style={styles.moreButton}>
        <MoreHorizontal size={18} color="#94A3B8" />
      </Pressable>
    </View>
  );

  const animatedHeight = useAnimatedStyle(() => ({ height: `${height.value}%` }));

  return (
    <Animated.View style={animatedHeight}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Comments</Text>
        <Text style={styles.count}>{comments.length}</Text>
        <View style={styles.headerSpacer} />
        <Pressable style={styles.closeButton} onPress={() => router.back()}>
          <X size={20} color="#64748B" />
        </Pressable>
      </View>

      {/* Comments List */}
      <BottomSheet.FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={renderComment}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Input */}
      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <BottomSheet.TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor="#94A3B8"
            onChangeText={setNewComment}
            value={newComment}
            maxLength={500}
            multiline
          />
          <Pressable
            style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
            onPress={addComment}
            disabled={!newComment.trim()}
          >
            <Send size={20} color={newComment.trim() ? "#FFF" : "#94A3B8"} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
  },
  count: {
    fontSize: 14,
    color: "#64748B",
    marginLeft: 8,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  headerSpacer: {
    flex: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  // List
  listContent: {
    padding: 16,
    gap: 16,
  },

  // Comment Item
  commentItem: {
    flexDirection: "row",
    gap: 12,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  commentAvatarText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  commentContent: {
    flex: 1,
    gap: 4,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  commentTime: {
    fontSize: 12,
    color: "#94A3B8",
  },
  commentText: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  commentActions: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  commentAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentActionText: {
    fontSize: 13,
    color: "#94A3B8",
  },
  commentActionTextActive: {
    color: "#EF4444",
  },
  moreButton: {
    padding: 4,
  },

  // Input
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    backgroundColor: "#FFF",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    backgroundColor: "#F8FAFC",
    borderRadius: 24,
    paddingLeft: 16,
    paddingRight: 6,
    paddingVertical: 6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#1E293B",
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#E2E8F0",
  },
});
