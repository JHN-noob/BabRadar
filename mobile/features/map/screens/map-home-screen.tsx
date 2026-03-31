import { Link } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getMockMapRestaurants, toMapRestaurants } from '@/features/map/lib/map-restaurants';
import { MapRestaurant } from '@/features/map/types/map-restaurant';
import { fetchNearbyRestaurants } from '@/lib/api/restaurants';

type SheetState = 'collapsed' | 'expanded';
type DataState = 'loading' | 'live' | 'fallback';

const DEFAULT_CENTER = {
  latitude: 37.498095,
  longitude: 127.02761,
};

const DEFAULT_RADIUS_METERS = 1200;
const DRAG_CAPTURE_THRESHOLD = 34;
const RELEASE_VELOCITY_THRESHOLD = 1.35;
const EDGE_RELEASE_ZONE = 64;
const SNAP_DURATION_MS = 220;

const topFilters = ['한식', '점심 추천', '가까운 순', '카페'];
const quickActions = ['현재 위치', '재검색', '필터'];
const sheetFilters = ['거리순', '점심 추천', '영업 중'];

export function MapHomeScreen() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [sheetState, setSheetState] = useState<SheetState>('collapsed');
  const [restaurants, setRestaurants] = useState<MapRestaurant[]>(() => getMockMapRestaurants());
  const [dataState, setDataState] = useState<DataState>('loading');
  const [statusMessage, setStatusMessage] = useState('주변 음식점을 불러오는 중입니다.');

  const bottomInset = Math.max(insets.bottom, 12);
  const expandedTopGap = insets.top + 120;
  const headerHeight = 152;
  const collapsedVisibleHeight = headerHeight + bottomInset;
  const sheetHeight = Math.max(height - expandedTopGap, collapsedVisibleHeight + 280);
  const collapsedOffset = Math.max(sheetHeight - collapsedVisibleHeight, 0);

  const translateY = useRef(new Animated.Value(collapsedOffset)).current;
  const dragStartOffsetRef = useRef(collapsedOffset);
  const currentStateRef = useRef<SheetState>('collapsed');
  const gestureStartStateRef = useRef<SheetState>('collapsed');
  const lastHapticAtRef = useRef(0);

  useEffect(() => {
    currentStateRef.current = sheetState;
  }, [sheetState]);

  useEffect(() => {
    const target = currentStateRef.current === 'expanded' ? 0 : collapsedOffset;
    translateY.setValue(target);
    dragStartOffsetRef.current = target;
  }, [collapsedOffset, translateY]);

  useEffect(() => {
    const abortController = new AbortController();

    async function loadNearbyRestaurants() {
      try {
        const response = await fetchNearbyRestaurants(
          {
            latitude: DEFAULT_CENTER.latitude,
            longitude: DEFAULT_CENTER.longitude,
            radiusMeters: DEFAULT_RADIUS_METERS,
            pageSize: 12,
            sort: 'distance',
            categoryGroupCode: 'FD6',
          },
          { signal: abortController.signal }
        );

        if (abortController.signal.aborted) {
          return;
        }

        if (response.items.length === 0) {
          setRestaurants(getMockMapRestaurants());
          setDataState('fallback');
          setStatusMessage('서버 응답이 비어 있어 목업 데이터를 보여주고 있습니다.');
          return;
        }

        setRestaurants(toMapRestaurants(response.items));
        setDataState('live');
        setStatusMessage('서버 nearby 데이터를 기준으로 목록을 표시하고 있습니다.');
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        setRestaurants(getMockMapRestaurants());
        setDataState('fallback');
        setStatusMessage(resolveNearbyErrorMessage(error));
      }
    }

    void loadNearbyRestaurants();

    return () => {
      abortController.abort();
    };
  }, []);

  function fireHaptic() {
    if (Platform.OS === 'web') {
      return;
    }

    const now = Date.now();
    if (now - lastHapticAtRef.current < 100) {
      return;
    }

    lastHapticAtRef.current = now;
    void Haptics.selectionAsync();
  }

  function completeSnap(nextState: SheetState, target: number, shouldHaptic: boolean) {
    currentStateRef.current = nextState;
    dragStartOffsetRef.current = target;
    setSheetState(nextState);

    if (shouldHaptic) {
      fireHaptic();
    }
  }

  function animateTo(nextState: SheetState, shouldHaptic: boolean) {
    const target = nextState === 'expanded' ? 0 : collapsedOffset;
    const didChange = nextState !== currentStateRef.current;

    translateY.stopAnimation();

    Animated.timing(translateY, {
      toValue: target,
      duration: SNAP_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) {
        return;
      }

      completeSnap(nextState, target, shouldHaptic && didChange);
    });
  }

  const headerPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > DRAG_CAPTURE_THRESHOLD &&
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderGrant: () => {
        gestureStartStateRef.current = currentStateRef.current;
        translateY.stopAnimation((value) => {
          dragStartOffsetRef.current = value;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        const nextOffset = clamp(
          dragStartOffsetRef.current + gestureState.dy,
          0,
          collapsedOffset
        );

        translateY.setValue(nextOffset);
      },
      onPanResponderRelease: (_, gestureState) => {
        const releasedOffset = clamp(
          dragStartOffsetRef.current + gestureState.dy,
          0,
          collapsedOffset
        );

        const reachedTopEdge = gestureState.moveY <= insets.top + EDGE_RELEASE_ZONE;
        const reachedBottomEdge =
          gestureState.moveY >= height - Math.max(insets.bottom, 20) - EDGE_RELEASE_ZONE;

        if (gestureState.vy <= -RELEASE_VELOCITY_THRESHOLD) {
          animateTo('expanded', true);
          return;
        }

        if (gestureState.vy >= RELEASE_VELOCITY_THRESHOLD) {
          animateTo('collapsed', true);
          return;
        }

        if (releasedOffset <= 0 || reachedTopEdge) {
          animateTo('expanded', true);
          return;
        }

        if (releasedOffset >= collapsedOffset || reachedBottomEdge) {
          animateTo('collapsed', true);
          return;
        }

        animateTo(gestureStartStateRef.current, false);
      },
      onPanResponderTerminate: () => {
        animateTo(gestureStartStateRef.current, false);
      },
    })
  ).current;

  const expandedProgress = translateY.interpolate({
    inputRange: [0, collapsedOffset || 1],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const quickActionOpacity = expandedProgress.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [1, 0.35, 0],
    extrapolate: 'clamp',
  });

  const quickActionTranslateY = expandedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 16],
    extrapolate: 'clamp',
  });

  const sheetContentOpacity = expandedProgress.interpolate({
    inputRange: [0, 0.2, 0.55, 1],
    outputRange: [0, 0.08, 0.62, 1],
    extrapolate: 'clamp',
  });

  const sheetContentTranslateY = expandedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
    extrapolate: 'clamp',
  });

  return (
    <ThemedView style={styles.screen}>
      <View style={styles.mapCanvas}>
        <View style={[styles.road, styles.roadPrimary]} />
        <View style={[styles.road, styles.roadSecondary]} />
        <View style={[styles.road, styles.roadAccent]} />
        <View style={styles.park} />
        <View style={styles.currentLocationPulse} />
        <View style={styles.currentLocationDot} />

        {restaurants.map((restaurant) => (
          <MapPin
            key={restaurant.id}
            label={restaurant.name}
            highlighted={restaurant.highlighted}
            style={{
              top: restaurant.mapTop as ViewStyle['top'],
              left: restaurant.mapLeft as ViewStyle['left'],
            }}
          />
        ))}
      </View>

      <SafeAreaView
        pointerEvents="box-none"
        style={[styles.overlay, { paddingBottom: collapsedVisibleHeight + 16 }]}
        edges={['top']}>
        <View style={styles.topPanel}>
          <View style={styles.searchBar}>
            <View style={styles.searchDot} />
            <View style={styles.searchTextWrap}>
              <ThemedText type="defaultSemiBold">강남역 근처 식당</ThemedText>
              <ThemedText style={styles.subtleText}>
                지금 위치 기준으로 가까운 곳부터 둘러보세요.
              </ThemedText>
            </View>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}>
            {topFilters.map((filter) => (
              <View key={filter} style={styles.filterChip}>
                <ThemedText type="defaultSemiBold">{filter}</ThemedText>
              </View>
            ))}
          </ScrollView>
        </View>

        <Animated.View
          style={[
            styles.quickActionStack,
            {
              opacity: quickActionOpacity,
              transform: [{ translateY: quickActionTranslateY }],
            },
          ]}>
          {quickActions.map((action) => (
            <Pressable key={action} style={styles.quickAction}>
              <ThemedText type="defaultSemiBold">{action}</ThemedText>
            </Pressable>
          ))}
        </Animated.View>
      </SafeAreaView>

      <Animated.View
        style={[
          styles.bottomSheet,
          {
            height: sheetHeight,
            paddingBottom: bottomInset + 16,
            transform: [{ translateY }],
          },
        ]}>
        <View style={styles.sheetHeaderZone} {...headerPanResponder.panHandlers}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetTitleWrap}>
            <ThemedText type="subtitle">근처 맛집 {restaurants.length}곳</ThemedText>
            <ThemedText style={styles.subtleText}>
              윗부분을 길게 끌어올리거나 내려서 화면을 전환합니다.
            </ThemedText>
          </View>
          <View style={styles.headerHintChip}>
            <ThemedText type="defaultSemiBold">
              {sheetState === 'expanded' ? '아래로 내려서 닫기' : '위로 올려서 펼치기'}
            </ThemedText>
          </View>
          <ThemedText style={styles.statusText}>
            {getDataStateLabel(dataState)} · {statusMessage}
          </ThemedText>
        </View>

        <Animated.View
          pointerEvents={sheetState === 'expanded' ? 'auto' : 'none'}
          style={[
            styles.sheetContent,
            {
              opacity: sheetContentOpacity,
              transform: [{ translateY: sheetContentTranslateY }],
            },
          ]}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sheetFilterRow}>
            {sheetFilters.map((filter) => (
              <View key={filter} style={styles.sheetFilterChip}>
                <ThemedText type="defaultSemiBold">{filter}</ThemedText>
              </View>
            ))}
          </ScrollView>

          <ScrollView
            scrollEnabled={sheetState === 'expanded'}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.cardList}
            style={styles.sheetScroll}>
            {restaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={{
                  pathname: '/restaurant/[restaurantId]',
                  params: { restaurantId: restaurant.id },
                }}
                asChild>
                <Pressable style={styles.restaurantCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleWrap}>
                      <ThemedText type="defaultSemiBold">{restaurant.name}</ThemedText>
                      <ThemedText style={styles.subtleText}>
                        {restaurant.category} · {restaurant.distanceMeters ?? '-'}m · {restaurant.etaLabel}
                      </ThemedText>
                    </View>
                    {restaurant.highlighted ? (
                      <View style={styles.recommendBadge}>
                        <ThemedText type="defaultSemiBold">추천</ThemedText>
                      </View>
                    ) : null}
                  </View>

                  <ThemedText>{restaurant.summary}</ThemedText>

                  <View style={styles.metaRow}>
                    <View style={styles.metaChip}>
                      <ThemedText type="defaultSemiBold">상세 보기</ThemedText>
                    </View>
                    <View style={styles.metaChipMuted}>
                      <ThemedText type="defaultSemiBold">{restaurant.address}</ThemedText>
                    </View>
                  </View>
                </Pressable>
              </Link>
            ))}
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </ThemedView>
  );
}

type MapPinProps = {
  label: string;
  highlighted?: boolean;
  style?: StyleProp<ViewStyle>;
};

function MapPin({ label, highlighted, style }: MapPinProps) {
  return (
    <View style={[styles.pinWrap, style]}>
      <View style={[styles.pin, highlighted ? styles.pinHighlighted : null]}>
        <ThemedText
          type="defaultSemiBold"
          style={[styles.pinText, highlighted ? styles.pinTextHighlighted : null]}>
          {label}
        </ThemedText>
      </View>
      <View style={[styles.pinStem, highlighted ? styles.pinStemHighlighted : null]} />
    </View>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function resolveNearbyErrorMessage(error: unknown) {
  if (error instanceof Error) {
    if (error.message.includes('EXPO_PUBLIC_SERVER_BASE_URL')) {
      return '서버 주소가 없어 목업 데이터를 표시하고 있습니다.';
    }

    if (error.message.includes('KAKAO_REST_API_KEY')) {
      return 'Kakao 키가 없어 목업 데이터를 표시하고 있습니다.';
    }

    return `${error.message} 목업 데이터로 계속 진행합니다.`;
  }

  return 'Nearby 요청에 실패해 목업 데이터를 표시하고 있습니다.';
}

function getDataStateLabel(dataState: DataState) {
  switch (dataState) {
    case 'live':
      return '실데이터';
    case 'fallback':
      return '목업 데이터';
    default:
      return '로딩 중';
  }
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#DCE6D6',
  },
  mapCanvas: {
    flex: 1,
    backgroundColor: '#DCE6D6',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  topPanel: {
    paddingTop: 12,
    gap: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#18222A',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  searchDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#2F6F5E',
  },
  searchTextWrap: {
    flex: 1,
    gap: 2,
  },
  subtleText: {
    color: '#5F6B76',
  },
  filterRow: {
    gap: 10,
    paddingRight: 24,
  },
  filterChip: {
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  quickActionStack: {
    alignSelf: 'flex-end',
    gap: 10,
    marginBottom: 8,
  },
  quickAction: {
    minWidth: 88,
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  road: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  roadPrimary: {
    top: '26%',
    left: '-10%',
    width: '130%',
    height: 18,
    transform: [{ rotate: '-18deg' }],
  },
  roadSecondary: {
    top: '47%',
    left: '-8%',
    width: '115%',
    height: 14,
    transform: [{ rotate: '11deg' }],
  },
  roadAccent: {
    top: '18%',
    left: '58%',
    width: 14,
    height: '50%',
  },
  park: {
    position: 'absolute',
    top: '55%',
    left: '10%',
    width: 110,
    height: 78,
    borderRadius: 24,
    backgroundColor: '#CBE1C0',
  },
  currentLocationPulse: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    width: 34,
    height: 34,
    borderRadius: 999,
    marginLeft: -17,
    marginTop: -17,
    backgroundColor: 'rgba(67, 135, 255, 0.18)',
  },
  currentLocationDot: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    width: 16,
    height: 16,
    borderRadius: 999,
    marginLeft: -8,
    marginTop: -8,
    borderWidth: 3,
    borderColor: '#EAF2FF',
    backgroundColor: '#4387FF',
  },
  pinWrap: {
    position: 'absolute',
    alignItems: 'center',
  },
  pin: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#18222A',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  pinHighlighted: {
    backgroundColor: '#1E7C64',
  },
  pinText: {
    color: '#0F1720',
  },
  pinTextHighlighted: {
    color: '#FFFFFF',
  },
  pinStem: {
    width: 4,
    height: 12,
    marginTop: 2,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  pinStemHighlighted: {
    backgroundColor: '#1E7C64',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 18,
    backgroundColor: '#FCFCFA',
    shadowColor: '#0F1720',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
    overflow: 'hidden',
  },
  sheetHeaderZone: {
    gap: 12,
    paddingTop: 12,
    paddingBottom: 12,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 52,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#D3DCE2',
  },
  sheetTitleWrap: {
    gap: 4,
  },
  headerHintChip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#EEF2F4',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statusText: {
    color: '#5F6B76',
  },
  sheetContent: {
    flex: 1,
    gap: 12,
    paddingTop: 6,
  },
  sheetFilterRow: {
    gap: 10,
    paddingRight: 24,
  },
  sheetFilterChip: {
    borderRadius: 999,
    backgroundColor: '#EEF2F4',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sheetScroll: {
    flex: 1,
  },
  cardList: {
    gap: 12,
    paddingBottom: 20,
  },
  restaurantCard: {
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    padding: 16,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardTitleWrap: {
    flex: 1,
    gap: 2,
  },
  recommendBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#DCEFE9',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    borderRadius: 999,
    backgroundColor: '#E8F1EE',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metaChipMuted: {
    borderRadius: 999,
    backgroundColor: '#F3F5F7',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
