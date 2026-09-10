import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import axiosClient from '../../api/AxiosClient';
import { colors } from '../../utils/Colors';
import AppText from '../AppText/AppText';

type ActivityPeriod = 'today' | 'month' | 'year';
type ActivityKey = 'tent_meet' | 'van_activity' | 'mechanic_meet' | 'retailer_meet';
type ActivityCounts = Record<ActivityKey, number>;

const emptyCounts: ActivityCounts = {
  tent_meet: 0,
  van_activity: 0,
  mechanic_meet: 0,
  retailer_meet: 0,
};

const periods: { key: ActivityPeriod; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'month', label: 'This Month' },
  { key: 'year', label: 'This Year' },
];

const activityMeta: {
  key: ActivityKey;
  label: string;
  color: string;
  background: string;
  icon: 'tent' | 'van' | 'mechanic' | 'retailer';
}[] = [
  { key: 'tent_meet', label: 'Tent Meet', color: '#41599F', background: '#E4E9F8', icon: 'tent' },
  { key: 'van_activity', label: 'Van Activity', color: '#159F69', background: '#DDF3EA', icon: 'van' },
  { key: 'mechanic_meet', label: 'Mechanic Meet', color: '#C97C18', background: '#FCE6C3', icon: 'mechanic' },
  { key: 'retailer_meet', label: 'Retailer Meet', color: '#74725A', background: '#EFF0E2', icon: 'retailer' },
];

const ActivityIcon = ({ name, color }: { name: 'tent' | 'van' | 'mechanic' | 'retailer'; color: string }) => {
  if (name === 'van') {
    return (
      <Svg width={25} height={25} viewBox="0 0 25 25">
        <Path d="M3 8.5h13v9H3zM16 11h3.2l2.8 3v3.5h-6" fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
        <Circle cx={7} cy={18} r={2} fill="#fff" stroke={color} strokeWidth={1.8} />
        <Circle cx={18.5} cy={18} r={2} fill="#fff" stroke={color} strokeWidth={1.8} />
      </Svg>
    );
  }

  if (name === 'mechanic') {
    return (
      <Svg width={25} height={25} viewBox="0 0 25 25">
        <Path d="m5 18 8.5-8.5M11 7l7 7M15.2 5.2l4.6 4.6M4.3 17.3l3.4 3.4 3-3-3.4-3.4z" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  if (name === 'retailer') {
    return (
      <Svg width={26} height={26} viewBox="0 0 26 26">
        <Circle cx={9} cy={8} r={3} fill="none" stroke={color} strokeWidth={1.8} />
        <Circle cx={17.5} cy={10} r={2.5} fill="none" stroke={color} strokeWidth={1.8} />
        <Path d="M3.5 20c.5-4.5 2.4-6.5 5.5-6.5s5.1 2 5.5 6.5M14 15c3.9-1 7.5 1.2 8 5" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      </Svg>
    );
  }

  return (
    <Svg width={25} height={25} viewBox="0 0 25 25">
      <Path d="m4 10 8.5-5 8.5 5v10H4zM9.5 20v-6h6v6" fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
};

const PromotionalActivitiesOverview = ({ onViewAll }: { onViewAll?: () => void }) => {
  const [period, setPeriod] = useState<ActivityPeriod>('today');
  const [counts, setCounts] = useState<ActivityCounts>(emptyCounts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchActivityCounts = async () => {
      try {
        setLoading(true);
        setError(false);
        const response = await axiosClient.get('api/dashboard/summary', {
          params: { activityPeriod: period },
        });
        const activityCounts = response.data?.data?.promotional_activities?.counts;

        if (active) {
          setCounts({
            tent_meet: Number(activityCounts?.tent_meet ?? 0),
            van_activity: Number(activityCounts?.van_activity ?? 0),
            mechanic_meet: Number(activityCounts?.mechanic_meet ?? 0),
            retailer_meet: Number(activityCounts?.retailer_meet ?? 0),
          });
        }
      } catch (fetchError) {
        console.log('Failed to fetch promotional activity counts:', fetchError);
        if (active) {
          setCounts(emptyCounts);
          setError(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchActivityCounts();
    return () => {
      active = false;
    };
  }, [period, retryKey]);

  const progressMaximum = useMemo(
    () => Math.max(25, ...Object.values(counts)),
    [counts],
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <AppText size={20} color="#171719" family="InterBold">Promotional Activities</AppText>
        <Pressable onPress={onViewAll} hitSlop={10}>
          <AppText size={14} color={colors.blue} family="InterSemiBold">View All  →</AppText>
        </Pressable>
      </View>

      <View style={styles.panel}>
        <View style={styles.tabs}>
          {periods.map(item => {
            const selected = period === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setPeriod(item.key)}
                style={[styles.tab, selected && styles.activeTab]}
              >
                <AppText
                  size={14}
                  color={selected ? colors.blue : '#89899F'}
                  family="InterBold"
                >
                  {item.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <View style={styles.feedback}>
            <ActivityIndicator color={colors.blue} />
            <AppText size={13} color="#89899F" family="InterMedium">Loading activities…</AppText>
          </View>
        ) : error ? (
          <View style={styles.feedback}>
            <AppText size={13} color="#89899F" family="InterMedium">Unable to load activities</AppText>
            <Pressable onPress={() => setRetryKey(value => value + 1)} hitSlop={8}>
              <AppText size={13} color={colors.blue} family="InterSemiBold">Retry</AppText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {activityMeta.map((item, index) => {
              const count = counts[item.key];
              const progress = progressMaximum ? Math.min(100, (count / progressMaximum) * 100) : 0;

              return (
                <View key={item.key} style={[styles.activityRow, index > 0 && styles.rowBorder]}>
                  <View style={[styles.iconBox, { backgroundColor: item.background }]}>
                    <ActivityIcon name={item.icon} color={item.color} />
                  </View>
                  <View style={styles.activityContent}>
                    <View style={styles.labelRow}>
                      <AppText size={16} color="#171719" family="InterBold">{item.label}</AppText>
                      <AppText size={19} color="#171719" family="InterBold">{count}</AppText>
                    </View>
                    <View style={styles.track}>
                      <View style={[styles.fill, { width: `${progress}%` }]} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { marginTop: 26, paddingHorizontal: 20 },
  header: { marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  panel: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 20, backgroundColor: colors.white, borderRadius: 22, shadowColor: '#233054', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 4 },
  tabs: { flexDirection: 'row', gap: 8 },
  tab: { flex: 1, minHeight: 42, paddingHorizontal: 4, borderWidth: 1, borderColor: '#E0E1E8', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  activeTab: { borderWidth: 1.5, borderColor: colors.blue },
  feedback: { minHeight: 270, gap: 10, alignItems: 'center', justifyContent: 'center' },
  list: { marginTop: 20 },
  activityRow: { minHeight: 69, flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  rowBorder: { borderTopWidth: 1, borderTopColor: '#ECECEF' },
  iconBox: { width: 41, height: 41, marginRight: 14, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  activityContent: { flex: 1 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  track: { height: 6, marginTop: 7, marginRight: 23, borderRadius: 99, overflow: 'hidden', backgroundColor: '#E1E2EC' },
  fill: { height: '100%', borderRadius: 99, backgroundColor: '#41599F' },
});

export default PromotionalActivitiesOverview;
