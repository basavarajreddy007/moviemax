import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { channelAPI } from "../../services/api";
import toast from "react-hot-toast";

export const fetchMySubscriptions = createAsyncThunk(
  "subscription/fetchMySubscriptions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await channelAPI.getMySubscriptions();
      return response.data?.data || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch subscriptions");
    }
  }
);

export const checkSubscriptionStatus = createAsyncThunk(
  "subscription/checkSubscriptionStatus",
  async (channelId, { rejectWithValue }) => {
    try {
      const response = await channelAPI.checkSubscription(channelId);
      return { channelId, data: response.data?.data || {} };
    } catch (err) {
      return rejectWithValue({ channelId, message: err.response?.data?.message });
    }
  }
);

export const subscribeChannel = createAsyncThunk(
  "subscription/subscribeChannel",
  async ({ channelId, preference = "all" }, { rejectWithValue }) => {
    try {
      const response = await channelAPI.subscribe(channelId, { preference });
      return { channelId, data: response.data };
    } catch (err) {
      return rejectWithValue({ channelId, message: err.response?.data?.message || "Failed to subscribe" });
    }
  }
);

export const unsubscribeChannel = createAsyncThunk(
  "subscription/unsubscribeChannel",
  async (channelId, { rejectWithValue }) => {
    try {
      const response = await channelAPI.unsubscribe(channelId);
      return { channelId, data: response.data };
    } catch (err) {
      return rejectWithValue({ channelId, message: err.response?.data?.message || "Failed to unsubscribe" });
    }
  }
);

export const updateNotificationPreference = createAsyncThunk(
  "subscription/updateNotificationPreference",
  async ({ channelId, preference }, { rejectWithValue }) => {
    try {
      const response = await channelAPI.updateNotificationPreference(channelId, preference);
      return { channelId, preference, data: response.data };
    } catch (err) {
      return rejectWithValue({ channelId, message: err.response?.data?.message || "Failed to update notification preference" });
    }
  }
);

const initialState = {

  channelsMap: {},
  mySubscriptionsList: [],
  loading: false,
  error: null
};

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    setChannelState: (state, action) => {
      const { channelId, isSubscribed, notificationPreference, subscribersCount } = action.payload;
      state.channelsMap[channelId] = {
        isSubscribed: isSubscribed ?? state.channelsMap[channelId]?.isSubscribed ?? false,
        notificationPreference: notificationPreference || state.channelsMap[channelId]?.notificationPreference || "all",
        subscribersCount: subscribersCount ?? state.channelsMap[channelId]?.subscribersCount ?? 0
      };
    },
    optimisticSubscribe: (state, action) => {
      const { channelId, preference = "all" } = action.payload;
      const current = state.channelsMap[channelId] || { isSubscribed: false, subscribersCount: 0 };
      state.channelsMap[channelId] = {
        ...current,
        isSubscribed: true,
        notificationPreference: preference,
        subscribersCount: current.subscribersCount + 1,
        previousState: { ...current }
      };
    },
    optimisticUnsubscribe: (state, action) => {
      const { channelId } = action.payload;
      const current = state.channelsMap[channelId] || { isSubscribed: true, subscribersCount: 1 };
      state.channelsMap[channelId] = {
        ...current,
        isSubscribed: false,
        subscribersCount: Math.max(0, current.subscribersCount - 1),
        previousState: { ...current }
      };
    },
    rollbackSubscription: (state, action) => {
      const { channelId } = action.payload;
      if (state.channelsMap[channelId]?.previousState) {
        state.channelsMap[channelId] = { ...state.channelsMap[channelId].previousState };
      }
    }
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchMySubscriptions.fulfilled, (state, action) => {
        state.mySubscriptionsList = action.payload;
        action.payload.forEach((sub) => {
          if (sub.channel?._id) {
            state.channelsMap[sub.channel._id] = {
              isSubscribed: true,
              notificationPreference: sub.notificationPreference || "all",
              subscribersCount: sub.channel.subscribersCount || 0
            };
          }
        });
      })

      .addCase(checkSubscriptionStatus.fulfilled, (state, action) => {
        const { channelId, data } = action.payload;
        state.channelsMap[channelId] = {
          ...state.channelsMap[channelId],
          isSubscribed: data.isSubscribed ?? false,
          notificationPreference: data.notificationPreference || "all",
          subscribedAt: data.subscribedAt || null
        };
      })

      .addCase(subscribeChannel.fulfilled, (state, action) => {
        const { channelId, data } = action.payload;
        state.channelsMap[channelId] = {
          isSubscribed: true,
          notificationPreference: data.notificationPreference || "all",
          subscribersCount: data.subscribersCount ?? (state.channelsMap[channelId]?.subscribersCount || 0)
        };
      })
      .addCase(subscribeChannel.rejected, (state, action) => {
        const { channelId, message } = action.payload || {};
        if (channelId) {
          if (state.channelsMap[channelId]?.previousState) {
            state.channelsMap[channelId] = { ...state.channelsMap[channelId].previousState };
          }
        }
        toast.error(message || "Failed to subscribe");
      })

      .addCase(unsubscribeChannel.fulfilled, (state, action) => {
        const { channelId, data } = action.payload;
        state.channelsMap[channelId] = {
          isSubscribed: false,
          notificationPreference: "all",
          subscribersCount: data.subscribersCount ?? Math.max(0, (state.channelsMap[channelId]?.subscribersCount || 1) - 1)
        };
        state.mySubscriptionsList = state.mySubscriptionsList.filter((s) => s.channel?._id !== channelId);
      })
      .addCase(unsubscribeChannel.rejected, (state, action) => {
        const { channelId, message } = action.payload || {};
        if (channelId) {
          if (state.channelsMap[channelId]?.previousState) {
            state.channelsMap[channelId] = { ...state.channelsMap[channelId].previousState };
          }
        }
        toast.error(message || "Failed to unsubscribe");
      })

      .addCase(updateNotificationPreference.fulfilled, (state, action) => {
        const { channelId, preference } = action.payload;
        if (state.channelsMap[channelId]) {
          state.channelsMap[channelId].notificationPreference = preference;
        }
      });
  }
});

export const {
  setChannelState,
  optimisticSubscribe,
  optimisticUnsubscribe,
  rollbackSubscription
} = subscriptionSlice.actions;

const DEFAULT_CHANNEL_MAP = {};
const DEFAULT_MY_SUBSCRIPTIONS = [];
const DEFAULT_CHANNEL_SUB_STATE = { isSubscribed: false, notificationPreference: "all", subscribersCount: 0 };

export const selectSubscriptionMap = (state) => state.subscription?.channelsMap || DEFAULT_CHANNEL_MAP;
export const selectMySubscriptions = (state) => state.subscription?.mySubscriptionsList || DEFAULT_MY_SUBSCRIPTIONS;
export const selectChannelSubscription = (channelId) => (state) =>
  state.subscription?.channelsMap?.[channelId] || DEFAULT_CHANNEL_SUB_STATE;

export default subscriptionSlice.reducer;
