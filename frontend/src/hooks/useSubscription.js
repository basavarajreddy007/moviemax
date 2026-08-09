import { useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  checkSubscriptionStatus,
  subscribeChannel,
  unsubscribeChannel,
  updateNotificationPreference,
  optimisticSubscribe,
  optimisticUnsubscribe,
  setChannelState,
  selectChannelSubscription,
  selectMySubscriptions
} from "../redux/slices/subscriptionSlice";

export function useSubscription(channelId, initialData = {}) {
  const dispatch = useDispatch();
  const subscriptionState = useSelector(selectChannelSubscription(channelId));
  const mySubscriptions = useSelector(selectMySubscriptions);

  useEffect(() => {
    if (channelId && initialData && (initialData.subscribersCount !== undefined || initialData.isSubscribed !== undefined)) {
      dispatch(setChannelState({
        channelId,
        isSubscribed: initialData.isSubscribed,
        notificationPreference: initialData.notificationPreference || "all",
        subscribersCount: initialData.subscribersCount
      }));
    }
  }, [channelId, initialData.isSubscribed, initialData.subscribersCount, initialData.notificationPreference, dispatch]);

  const checkStatus = useCallback(() => {
    if (channelId) {
      dispatch(checkSubscriptionStatus(channelId));
    }
  }, [channelId, dispatch]);

  const subscribe = useCallback(async (preference = "all") => {
    if (!channelId) return;
    dispatch(optimisticSubscribe({ channelId, preference }));
    return dispatch(subscribeChannel({ channelId, preference })).unwrap();
  }, [channelId, dispatch]);

  const unsubscribe = useCallback(async () => {
    if (!channelId) return;
    dispatch(optimisticUnsubscribe({ channelId }));
    return dispatch(unsubscribeChannel(channelId)).unwrap();
  }, [channelId, dispatch]);

  const setPreference = useCallback(async (preference) => {
    if (!channelId) return;
    return dispatch(updateNotificationPreference({ channelId, preference })).unwrap();
  }, [channelId, dispatch]);

  return {
    isSubscribed: subscriptionState.isSubscribed,
    notificationPreference: subscriptionState.notificationPreference,
    subscribersCount: subscriptionState.subscribersCount,
    mySubscriptions,
    checkStatus,
    subscribe,
    unsubscribe,
    setPreference
  };
}
