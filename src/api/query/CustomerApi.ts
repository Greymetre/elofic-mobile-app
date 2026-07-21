import { useMutation } from "@tanstack/react-query";
import axiosClient from "../AxiosClient";
import { API_ENDPOINT } from "../ApiUrls";

// export const useMutateCustomerListApi = () => {
//     return useMutation({
//         mutationFn: (search?: string) => {
//             const params: Record<string, any> = { per_page: 20 };
//             if (search && search.trim().length > 0) {
//                 params.global_search = search.trim();
//             }
//             return axiosClient.get(API_ENDPOINT.MASTER_DISTRIBUTOR_GET, { params });
//         },
//     });
// };


export const useMutateCustomerListApi = () => {
    return useMutation({
        mutationFn: ({ search, page }: { search?: string; page?: number }) => {
            const params: Record<string, any> = {
                page: page || 1,
                per_page: 10
            };

            if (search && search.trim().length > 0) {
                params.global_search = search.trim();
            }

            return axiosClient.get(API_ENDPOINT.MASTER_DISTRIBUTOR_GET, { params });
        },
    });
};

// export const useMutateSecondaryCustListApi = () => {
//     return useMutation({
//         mutationFn: ({ type, search }: { type: string; search?: string }) => {
//             const params: Record<string, any> = {};
//             if (search && search.trim().length > 0) {
//                 params.global_search = search.trim();
//             }
//             // type is always required → goes in path
//             const url = `${API_ENDPOINT.SECONDARY_CUSTOMER_GET}${type}`;
//             return axiosClient.get(url, { params });
//         },
//     });
// };


export const useMutateSecondaryCustListApi = () => {
    return useMutation({
        mutationFn: ({
            type,
            search,
            page,
            status,
            city_name,
            for_user_id
        }: any) => {

            const params: any = {
                page: page || 1,
                per_page: 10,
                status: status || 'APPROVED',
            };

            if (search?.trim()) {
                params.global_search = search.trim();
            }

            if (city_name) {
                params.city_name = city_name;
            }
            if (for_user_id) {
                params.for_user_id = for_user_id;
            }

            console.log(`${API_ENDPOINT.SECONDARY_CUSTOMER_GET}${type}`,
                { params }, 'saldjfaljsdhfjlashdflasd')

            return axiosClient.get(
                `${API_ENDPOINT.SECONDARY_CUSTOMER_GET}${type}`,
                { params }
            );
        },
    });
};


export const useMutateBeatCustomerList = () => {
    return useMutation({
        mutationFn: ({
            type,
            search,
            page,
            status,
            city_name,
        }: any) => {

            const params: any = {
                page: page || 1,
                per_page: 10,
            };

            if (search?.trim()) {
                params.search = search.trim();
            }
            if (status) {
                params.status = status || 'APPROVED';
            }

            if (city_name) {
                params.city_name = city_name;
            }
            // if (for_user_id) {
            //     params.for_user_id = for_user_id;
            // }

            

            return axiosClient.get(
                `${API_ENDPOINT.GET_BEAT_CUSTOMER_LIST}${type}`,
                { params }
            );
        },
    });
};

export const useGetStateListApi = () => {
    return useMutation({
        mutationFn: () =>
            axiosClient.get(
                API_ENDPOINT.GET_STATE_LIST
            ),
    });
};

export const useGetDistrictListApi = () => {
    return useMutation({
        mutationFn: (payload: any) =>
            axiosClient.get(
                API_ENDPOINT.GET_DISTRICT_LIST + `?state_id=${payload}`
            ),
    });
};

export const useGetCityListApi = () => {
    return useMutation({
        mutationFn: (payload: any) =>
            axiosClient.get(
                API_ENDPOINT.GET_CITIES_LIST + `?district_id=${payload}`
            ),
    });
};

export const useGetUserCityListApi = () => {
    return useMutation({
        mutationFn: () =>
            axiosClient.get(
                API_ENDPOINT.GET_USER_CITIES_LIST
            ),
    });
};

export const useGetUserDistrictListApi = () => {
    return useMutation({
        mutationFn: () =>
            axiosClient.get(
                API_ENDPOINT.GET_USER_DISTRICT_LIST
            ),
    });
};

export const useGetPincodeListAPi = () => {
    return useMutation({
        mutationFn: (payload: any) =>
            axiosClient.get(
                API_ENDPOINT.GET_PINCODES_LIST + `?city_id=${payload}`
            ),
    });
};


export const useGetPincodeLocationListAPi = () => {
    return useMutation({
        mutationFn: (payload: any) =>
            axiosClient.post(
                API_ENDPOINT.GET_LOCATION_FROM_PINCODE_LIST + `?pincode=${payload}`
            ),
    });
};

export const useGetBeatListApi = () => {
    return useMutation({
        mutationFn: () =>
            axiosClient.get(
                API_ENDPOINT.BEAT_LIST
            ),
    });
};

export const useGetDistributorListApi = () => {
    return useMutation({
        mutationFn: () =>
            axiosClient.get(
                API_ENDPOINT.MASTER_DISTRIBUTOR_DROPDOWN
            ),
    });
};

export const useGetDistributorDropdownListApi = () => {
    return useMutation({
        mutationFn: () =>
            axiosClient.get(
                API_ENDPOINT.MASTER_DISTRIBUTOR_DROPDOWN_Data
            ),
    });
};

export const useGetSuperVisorListApi = () => {
    return useMutation({
        mutationFn: () =>
            axiosClient.get(
                API_ENDPOINT.GET_SUPERVISOR_API
            ),
    });
};

// export const useGetAllAttanceReport = () => {
//     return useMutation({
//         mutationFn: (payload?: any) =>
//             axiosClient.get(
//                 API_ENDPOINT.GET_ALL_ATTENDANCE + `?type=${payload}`
//             ),
//     });
// };

export const useGetAllAttanceReport = () => {
  return useMutation({
    mutationFn: async (queryString : any = '') => {
        console.log(queryString, 'queryStringqueryString')
      // queryString example: "?type=leave&search_name=12345&status=1"
      const response = await axiosClient.get(
        API_ENDPOINT.GET_ALL_ATTENDANCE + queryString
      );
      return response;           // or return response.data
    },

    // Optional but very useful in real apps:
    // onSuccess: (data) => console.log("Attendance list loaded"),
    // onError: (err) => console.log("Failed to load attendance", err),
  });
};

export const useGetAttendanceData = () => {
    return useMutation({
        mutationFn: (payload: any) =>
            axiosClient.get(
                API_ENDPOINT.ATTENDANCE_DATA + `${payload}`
            ),
    });
};

export const useGetCustomerData = () => {
    return useMutation({
        mutationFn: (payload: any) =>
            axiosClient.get(
                API_ENDPOINT.MASTER_DISTRIBUTOR + `/${payload}`
            ),
    });
};

export const useGetSecondaryCustomerData = () => {
    return useMutation({
        mutationFn: (payload: { id: any, type: string }) =>
            axiosClient.get(
                API_ENDPOINT.SECONDARY_CUSTOMER + `/${payload?.id}?type=${payload?.type}`
            ),
    });
};

export const useGetTourPlanData = () => {
    return useMutation({
        mutationFn: (payload: { start_date: any, end_date: any, user_id: any }) =>
            axiosClient.get(
                API_ENDPOINT.TOUR_GET_SHOW + `?start_date=${payload?.start_date}&end_date=${payload?.end_date}&user_id=${payload?.user_id}`
            ),
    });
};

export const useGetTodayBeatPlanData = () => {
    return useMutation({
        mutationFn: () =>
            axiosClient.get(
                API_ENDPOINT.BEAT_PLAN_DATA
            ),
    });
};


export const useGetSubmitCheckIN = () => {
    return useMutation({
        mutationFn: (payload: { entity_type: any, entity_id: string, checkin_latitude: any, checkin_longitude: any }) =>
            axiosClient.post(
                API_ENDPOINT.CUSTOMER_CHECKIN, payload
            ),
    });
};


export const useGetUserActivity = () => {
    return useMutation({
        mutationFn: (payload: { user_id: any, date: any }) =>
            axiosClient.post(
                API_ENDPOINT.USER_ACTIVITY, payload
            ),
    });
};

export const useGetSubmitCheckout = () => {
    return useMutation({
        mutationFn: (payload:
            {
                entity_type: any,
                entity_id: any,
                checkout_latitude: any,
                checkout_longitude: any,
                checkin_id: any,
                description: string
            }) =>
            axiosClient.post(
                API_ENDPOINT.CUSTOMER_CHECKOUT, payload
            ),
    });
};



// src/api/query/CustomerApi.ts   (or wherever your mutations live)

export const useChangeAttendanceStatus = () => {
    return useMutation({
        mutationFn: (payload: { attendance_id: string | number; status: 1 | 2 | 3 }) =>
            axiosClient.post(API_ENDPOINT.CHANGE_ATTENDANCE_STATUS, payload),

        // Optional: you can add optimistic updates or refetch logic later
    });
};
// src/api/query/CHANGE_REJECT_EXPENSE_STATUS.ts   (or wherever your mutations live)

export const useRejectExpenseStatus = () => {
    return useMutation({
        mutationFn: (payload: { expense_id: string | number | any; reasons?: string | any }) =>
            axiosClient.post(API_ENDPOINT.CHANGE_REJECT_EXPENSE_STATUS, payload),

        // Optional: you can add optimistic updates or refetch logic later
    });
};
// src/api/query/CHANGE_APPROVE_EXPENSE_STATUS.ts   (or wherever your mutations live)

export const useApproveExpenseStatus = () => {
    return useMutation({
        mutationFn: (payload: { expense_id: string | number | any; approve_amnt?: any }) =>
            axiosClient.post(API_ENDPOINT.CHANGE_APPROVE_EXPENSE_STATUS, payload),

        // Optional: you can add optimistic updates or refetch logic later
    });
};

// src/api/query/CustomerApi.ts   (or wherever your mutations live)

export const useExpenseDetails = () => {
    return useMutation({
        mutationFn: (payload: { expense_id: string | number;}) =>
            axiosClient.post(API_ENDPOINT.EXPENSE_DETAILS, payload),

        // Optional: you can add optimistic updates or refetch logic later
    });
};