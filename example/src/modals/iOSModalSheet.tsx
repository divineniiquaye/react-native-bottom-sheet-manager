import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  FadeOutDown,
  useAnimatedReaction,
  useSharedValue,
} from "react-native-reanimated";
import {
  Check,
  ChevronUp,
  Music,
  Play,
  Shuffle,
  SkipBack,
  SkipForward,
} from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { scheduleOnRN } from "react-native-worklets";
import React from "react";

import {
  BottomSheet,
  SheetManager,
  SheetProps,
  useSheetRef,
} from "@niibase/bottom-sheet-manager";

/**
 * iOS Modal Sheet Demo
 *
 * Demonstrates the iOS-style modal sheet animation where the background
 * content scales down and gets rounded corners as the sheet expands to full screen.
 */
export default function IOSModalSheet({ id }: SheetProps<"ios-modal">) {
  const sheetRef = useSheetRef();
  const animatedIndex = useSharedValue(0);
  const [isExpanded, setIsExpanded] = React.useState(false);

  const [currentTrack, setCurrentTrack] = React.useState(0);
  const tracks = [
    { title: "Bohemian Rhapsody", artist: "Queen", duration: "5:55", cover: "🎸" },
    {
      title: "Stairway to Heaven",
      artist: "Led Zeppelin",
      duration: "8:02",
      cover: "🎵",
    },
    { title: "Hotel California", artist: "Eagles", duration: "6:30", cover: "🌴" },
    {
      title: "Smells Like Teen Spirit",
      artist: "Nirvana",
      duration: "5:01",
      cover: "🎤",
    },
    { title: "Billie Jean", artist: "Michael Jackson", duration: "4:54", cover: "👑" },
    {
      title: "Sweet Child O' Mine",
      artist: "Guns N' Roses",
      duration: "5:56",
      cover: "🌹",
    },
    { title: "Don't Stop Believin'", artist: "Journey", duration: "4:11", cover: "🚂" },
    { title: "Livin' on a Prayer", artist: "Bon Jovi", duration: "4:10", cover: "🎸" },
  ];

  const track = tracks[currentTrack];
  useAnimatedReaction(
    () => animatedIndex.value,
    (currentIndex) => {
      "worklet";
      scheduleOnRN(setIsExpanded, currentIndex > 0.3);
    },
  );

  return (
    <BottomSheet
      id={id}
      snapPoints={["32%", "90%"]}
      iosModalSheetTypeOfAnimation
      handleStyle={styles.handle}
      animatedIndex={animatedIndex}
      backgroundStyle={styles.background}
    >
      <BottomSheet.ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Mini Player (collapsed view) */}
        {!isExpanded && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.miniPlayer}
          >
            <View style={styles.miniPlayerContent}>
              <View style={styles.miniCover}>
                <Text style={styles.coverEmoji}>{track.cover}</Text>
              </View>
              <View style={styles.miniInfo}>
                <Text style={styles.miniTitle} numberOfLines={1}>
                  {track.title}
                </Text>
                <Text style={styles.miniArtist} numberOfLines={1}>
                  {track.artist}
                </Text>
              </View>
              <Pressable style={styles.miniPlayButton}>
                <Play size={24} color="#FFF" fill="#FFF" />
              </Pressable>
            </View>

            <Pressable
              style={styles.expandButton}
              onPress={() => sheetRef.current?.expand()}
            >
              <ChevronUp size={20} color="#94A3B8" />
              <Text style={styles.expandText}>Expand for full player</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Full Player (expanded view) */}
        {isExpanded && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            exiting={FadeOutDown.duration(200)}
            style={styles.fullPlayer}
          >
            <View style={styles.playerContainer}>
              {/* Album Art */}
              <View style={styles.albumArtContainer}>
                <View style={styles.albumArt}>
                  <Text style={styles.albumEmoji}>{track.cover}</Text>
                </View>
              </View>

              {/* Track Info */}
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>{track.title}</Text>
                <Text style={styles.trackArtist}>{track.artist}</Text>
              </View>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: "35%" }]} />
                </View>
                <View style={styles.timeContainer}>
                  <Text style={styles.timeText}>1:23</Text>
                  <Text style={styles.timeText}>{track.duration}</Text>
                </View>
              </View>
            </View>

            {/* Controls */}
            <View style={styles.controls}>
              <Pressable style={styles.controlButton}>
                <Shuffle size={24} color="#94A3B8" />
              </Pressable>
              <Pressable
                style={styles.controlButton}
                onPress={() => setCurrentTrack((p) => Math.max(0, p - 1))}
              >
                <SkipBack size={32} color="#FFF" fill="#FFF" />
              </Pressable>
              <Pressable style={styles.playButton}>
                <Play size={36} color="#000" fill="#000" />
              </Pressable>
              <Pressable
                style={styles.controlButton}
                onPress={() => setCurrentTrack((p) => Math.min(tracks.length - 1, p + 1))}
              >
                <SkipForward size={32} color="#FFF" fill="#FFF" />
              </Pressable>
              <Pressable style={styles.controlButton}>
                <Music size={24} color="#94A3B8" />
              </Pressable>
            </View>

            {/* Track List */}
            <View style={styles.trackListContainer}>
              <Text style={styles.trackListTitle}>Up Next</Text>
              <View style={styles.trackList}>
                {tracks.map((t, index) => (
                  <Pressable
                    key={index}
                    style={[
                      styles.trackItem,
                      currentTrack === index && styles.trackItemActive,
                    ]}
                    onPress={() => setCurrentTrack(index)}
                  >
                    <View style={styles.trackItemCover}>
                      <Text style={styles.trackItemEmoji}>{t.cover}</Text>
                    </View>
                    <View style={styles.trackItemInfo}>
                      <Text
                        style={[
                          styles.trackItemTitle,
                          currentTrack === index && styles.trackItemTitleActive,
                        ]}
                      >
                        {t.title}
                      </Text>
                      <Text style={styles.trackItemArtist}>{t.artist}</Text>
                    </View>
                    {currentTrack === index && <Check size={20} color="#10B981" />}
                  </Pressable>
                ))}
              </View>
            </View>
          </Animated.View>
        )}

        {/* Close Button */}
        <Pressable style={styles.closeButton} onPress={() => SheetManager.hide(id)}>
          <Text style={styles.closeButtonText}>Done</Text>
        </Pressable>
      </BottomSheet.ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  content: {
    paddingBottom: 20,
  },
  handle: {
    experimental_backgroundImage:
      "linear-gradient(360deg, #0F172A 0%,rgb(66, 80, 101) 100%)",
  } as unknown as { backgroundColor: string },
  background: {
    experimental_backgroundImage: "linear-gradient(180deg, #0F172A 0%, #64748B 100%)",
  } as unknown as { backgroundColor: string },

  // Mini Player
  miniPlayer: {
    gap: 20,
  },
  miniPlayerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  miniCover: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
  },
  coverEmoji: {
    fontSize: 28,
  },
  miniInfo: {
    flex: 1,
  },
  miniTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFF",
  },
  miniArtist: {
    fontSize: 14,
    color: "#94A3B8",
  },
  miniPlayButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  expandButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    backgroundColor: "#31425d",
    borderRadius: 12,
  },
  expandText: {
    color: "#94A3B8",
    fontSize: 14,
  },

  // Full Player
  fullPlayer: {
    flex: 1,
    gap: 20,
  },
  albumArtContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  albumArt: {
    width: 240,
    height: 240,
    borderRadius: 16,
    backgroundColor: "#1E293B",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  albumEmoji: {
    fontSize: 100,
  },
  trackInfo: {
    alignItems: "center",
    gap: 4,
  },
  trackTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFF",
  },
  trackArtist: {
    fontSize: 16,
    color: "#94A3B8",
  },
  progressContainer: {
    gap: 8,
    paddingHorizontal: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: "#334155",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10B981",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: {
    fontSize: 12,
    color: "#64748B",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  controlButton: {
    padding: 8,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFF",
    alignItems: "center",
    justifyContent: "center",
  },
  playerContainer: {
    flexDirection: "column",
  },
  trackListContainer: {
    flex: 1,
    gap: 12,
  },
  trackListTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#94A3B8",
    textTransform: "uppercase",
  },
  trackList: {
    flex: 1,
  },
  trackItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  trackItemActive: {
    backgroundColor: "#1E293B",
  },
  trackItemCover: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
  },
  trackItemEmoji: {
    fontSize: 20,
  },
  trackItemInfo: {
    flex: 1,
  },
  trackItemTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#FFF",
  },
  trackItemTitleActive: {
    color: "#10B981",
  },
  trackItemArtist: {
    fontSize: 13,
    color: "#94a6c0",
  },
  closeButton: {
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#31425d",
    marginTop: 12,
  },
  closeButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
