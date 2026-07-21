import { View, Text, ScrollView, FlatList, Pressable, ActivityIndicator, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { styles } from './styles'
import { rw } from '../../utils/responsive'
import AppText from '../../components/AppText/AppText'
import { ArrowDownIcon, CreateIcon, EyeIcon, PlusAddIcon } from '../../assets/svgs/SvgsFile'
import { useMutateTourPlanApi, useMutateTourPlanSelectApi } from '../../api/query/TourPlanApi'
import { Dropdown } from 'react-native-element-dropdown'
import { colors } from '../../utils/Colors'
import Toast from 'react-native-toast-message'
import store from '../../components/redux/Store'
import { fonts, shadowStyle } from '../../utils/typography'
import { SafeAreaView } from 'react-native-safe-area-context'

interface DropdownUser {
  label: string;
  value: number | string;
}

type TourPlanPageProps = {
  navigation: any
}
const TourPlanPage = ({ navigation }: TourPlanPageProps) => {

  const [selectedUserName, setSelectedUserName] = useState<string>('Select User');
  const [hasShowDropDown, setHasShowDropDown] = useState<any>(false)
  const [users, setUsers] = useState<DropdownUser[]>([]);
  const [usersSelect, setUsersSelect] = useState<DropdownUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | string | null>(null);
  const [userSearchText, setUserSearchText] = useState('');

  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [dropDownpage, setDropDownpage] = useState<number>(1);
  const [hasMoreDropDown, setHasMoreDropDown] = useState<boolean>(true);
  const [loadingDropDown, setLoadingDropDown] = useState<boolean>(false);
  useEffect(() => {
    // handleCustomerList()
  }, [])

  // Fetch users once on mount
  useEffect(() => {
    fetchUsers();
    fetchUsersDataSelect()
  }, []);

  const token = store.getState()?.auth?.token;

  // Fetch paginated user list
  const fetchUsers = useCallback(async (pageNum = 1, searchName = '') => {
    if (!token) {
      Toast.show({ type: 'error', text1: 'Authentication token not found' });
      return;
    }

    if (loading || (!hasMore && pageNum > 1)) return;

    setLoading(true);

    try {
      const url = `https://elofic.fieldkonnect.io/api/tour/userlist?page=${pageNum}&per_page=10${searchName ? `&search_name=${encodeURIComponent(searchName)}` : ''
        }`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const json = await response.json();

      if (json?.data?.data && Array.isArray(json.data.data)) {
        const newUsers = json.data.data.map((u: any) => ({
          label: u.name,
          value: u.user_id,
        }));
        // Append or replace based on page
        setUsers(prev => (pageNum === 1 ? newUsers : [...prev, ...newUsers]));
        setHasMore(json.data.current_page < json.data.last_page);
        setPage(pageNum);
      } else {
        Toast.show({ type: 'error', text1: 'Invalid user list response' });
      }
    } catch (err) {
      console.error('User fetch error:', err);
      Toast.show({ type: 'error', text1: 'Could not load users' });
    } finally {
      setLoading(false);
    }
  }, [token, loading, hasMore]);

  const fetchUsersDataSelect = async (pageNum = 1, searchName = '') => {
    setLoadingDropDown(true);
    const token = store.getState().auth?.token;

    if (!token) {
      Toast.show({ type: 'error', text1: 'Authentication token not found' });
      setLoadingDropDown(false);
      return;
    }
    const url = `https://elofic.fieldkonnect.io/api/tour/userlist?page=${pageNum}&per_page=10${searchName ? `&search_name=${encodeURIComponent(searchName)}` : ''
      }`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const json = await response.json();

      if (json?.data?.data && Array.isArray(json.data.data)) {

        const newUsers = json.data.data.map((u: any) => ({
          label: u.name,
          value: u.user_id,
        }));

        // add ALL option only on first page
        if (pageNum === 1) {
          const allOption = { label: 'All', value: 'all' };
          setUsersSelect([allOption, ...newUsers]);
        } else {
          setUsersSelect(prev => [...prev, ...newUsers]);
        }

        setHasMoreDropDown(json.data.current_page < json.data.last_page);
        setDropDownpage(pageNum);
      } else {
        Toast.show({ type: 'error', text1: 'Invalid user list response' });
      }
    } catch (err) {
      console.error('User fetch error:', err);
      Toast.show({ type: 'error', text1: 'Could not load users' });
    } finally {
      setLoadingDropDown(false);
    }
  };

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchUsers(page + 1);
    }
  }, [loading, hasMore, page, fetchUsers]);
  const loadMoreDropdown = useCallback(() => {
    if (!loadingDropDown && hasMoreDropDown) {
      fetchUsersDataSelect(dropDownpage + 1, userSearchText);
    }
  }, [loadingDropDown, hasMoreDropDown, dropDownpage, userSearchText]);

  const renderItem: any = useCallback((item: any) => {
    const itemD = item?.item
    const index = item?.index
    console.log(itemD, 'itemDitemDitemD');
    return (
      <View style={[styles.listItem, index % 2 == 0 && { backgroundColor: 'rgba(255, 255, 255, 0.6)' }, styles.row]}>
        <View style={{ flex: 1 }}>
          <AppText color='black' size={16} family='InterRegular' opacity={0.8}>{itemD?.label}</AppText>
        </View>
        <View style={[styles.row, { gap: 9 }]}>
          <Pressable style={[styles.iconView, styles.center]} onPress={() => navigation.navigate('CreatePlan', { item: itemD?.value })}>
            <CreateIcon />
          </Pressable>
          <Pressable style={[styles.iconView, styles.center]} onPress={() => {
            navigation.navigate('UserTourList', { item: itemD })
          }}>
            <EyeIcon />
          </Pressable>
        </View>
      </View>
    )
  }, [users])

  return (
    <View style={[styles.container, ]}> 
      <View style={styles.container}>

        <View style={styles.container}>
          <View style={[styles.container, { paddingHorizontal: rw(19) }]} >
            <View style={[styles.row, { gap: 10, marginVertical: 20 }]}>
              <Pressable style={[styles.dateTimeBox, styles.row, { justifyContent: 'space-between', flex: 1 }]}
                onPress={() => setHasShowDropDown(true)}>
                <View style={{ justifyContent: 'center' }}>
                  <AppText size={14} color="#718096" family="InterRegular">
                    {selectedUserName}
                  </AppText>
                </View>
                <ArrowDownIcon />
              </Pressable>
            </View>
            {hasShowDropDown && (
              <>
                <TouchableWithoutFeedback
                  onPress={() => {
                    setHasShowDropDown(false)
                    setUserSearchText('')
                    Keyboard.dismiss()
                  }}
                >
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0
                    }}
                  />
                </TouchableWithoutFeedback>
                <View style={[styles.listContainer, shadowStyle]}>

                  <View style={{ marginVertical: 16, marginHorizontal: 10 }}>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: '#ddd',
                        borderRadius: 8,
                        paddingHorizontal: 12,
                        paddingVertical: 10,
                        fontSize: 16,
                        backgroundColor: '#f9f9f9',
                        fontFamily: fonts.InterMedium,
                      }}
                      placeholder="Search user..."
                      value={userSearchText}
                      onChangeText={(text) => {
                        setUserSearchText(text)
                        setDropDownpage(1)
                        fetchUsersDataSelect(1, text)
                      }}
                    />
                  </View>

                  <FlatList

                    data={usersSelect}
                    keyExtractor={(item, index) =>
                      `${item?.value || index}`
                    }
                    renderItem={({ item }) => (
                      <Pressable
                        style={[
                          styles.innerContainer,
                          selectedUserId === item.value && {
                            backgroundColor: '#E6F0FF'
                          }
                        ]}
                        onPress={() => {

                          setSelectedUserId(item?.value)
                          setSelectedUserName(item?.label)
                          setHasShowDropDown(false)

                          // reset main list
                          setUsers([])
                          setPage(1)
                          setHasMore(true)

                          if (item.value === 'all') {
                            // show all users
                            fetchUsers(1)
                          } else {
                            // filter by selected user
                            fetchUsers(1, item?.label)
                          }

                        }}
                      >

                        <View
                          style={{ marginHorizontal: rw(10) }}
                        >
                          <AppText
                            color={selectedUserId === item.value ? colors.blue : 'black'} size={16} family='InterRegular' opacity={0.8}>
                            {item.label}
                          </AppText>

                        </View>
                      </Pressable>
                    )}

                    onEndReached={loadMoreDropdown}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={
                      loadingDropDown ? (
                        <ActivityIndicator
                          size="large"
                          color={colors.blue}
                        />
                      ) : null
                    }
                    showsVerticalScrollIndicator={false}
                  />
                </View>

              </>
            )}


            <FlatList
              data={users}
              keyExtractor={(item) => item?.value}
              onScroll={() => {
                if (hasShowDropDown) {
                  setHasShowDropDown(false);
                  setUserSearchText('')
                }
              }}
              maintainVisibleContentPosition={{ disabled: true }}
              scrollEventThrottle={16}
              ListEmptyComponent={
                loading ? <View style={{ flex: 1, marginTop: rw(50) }}>
                  <ActivityIndicator size="large" color={colors.blue} />
                </View> : (
                  <AppText size={16} color="gray" align="center" style={{ marginTop: rw(50) }}>
                    No users found
                  </AppText>
                )
              }
              ListFooterComponent={
                loading && page > 1 ? (
                  <ActivityIndicator size='large' color={colors.blue} style={{ marginVertical: rw(20) }} />
                ) : (
                  <View style={{height:50}} />
                )
              }
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              renderItem={renderItem} />

            <View style={{ height: 30 }} />
            {
              hasShowDropDown && (
                <TouchableWithoutFeedback
                  onPress={() => {
                    setHasShowDropDown(false)
                    setUserSearchText('')
                    Keyboard.dismiss()
                  }}
                >
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0
                    }}
                  />
                </TouchableWithoutFeedback>
              )
            }

          </View>
        </View>
      </View>
      
    </View>
  )
}

export default TourPlanPage


