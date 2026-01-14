import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function EventsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  // Mock events data
  const events = [
    {
      id: 1,
      title: "Annual Cooperative General Assembly",
      date: "December 15, 2024",
      time: "9:00 AM - 4:00 PM",
      location: "Main Cooperative Hall",
      description:
        "Annual meeting to discuss cooperative achievements, financial reports, and future plans.",
      attendees: 150,
      image:
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=250&fit=crop",
      status: "upcoming",
      isAttending: true,
    },
    {
      id: 2,
      title: "Organic Farming Workshop",
      date: "December 20, 2024",
      time: "8:00 AM - 12:00 PM",
      location: "Agricultural Training Center",
      description:
        "Learn modern organic farming techniques and sustainable agriculture practices.",
      attendees: 75,
      image:
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=250&fit=crop",
      status: "upcoming",
      isAttending: false,
    },
    {
      id: 3,
      title: "Harvest Festival & Market Day",
      date: "November 30, 2024",
      time: "7:00 AM - 5:00 PM",
      location: "Cooperative Farm Grounds",
      description:
        "Celebrate the harvest season with market stalls, cultural performances, and farm tours.",
      attendees: 300,
      image:
        "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400&h=250&fit=crop",
      status: "past",
      isAttending: true,
    },
    {
      id: 4,
      title: "Financial Literacy Seminar",
      date: "January 10, 2025",
      time: "1:00 PM - 5:00 PM",
      location: "Conference Room",
      description:
        "Understanding financial management, savings, and investment opportunities for members.",
      attendees: 60,
      image:
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=250&fit=crop",
      status: "upcoming",
      isAttending: false,
    },
    {
      id: 5,
      title: "Youth Entrepreneurship Program",
      date: "October 25, 2024",
      time: "9:00 AM - 3:00 PM",
      location: "Youth Center",
      description:
        "Empowering young members with business skills and startup ideas.",
      attendees: 45,
      image:
        "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop",
      status: "past",
      isAttending: false,
    },
  ];

  const filteredEvents = events.filter((event) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "upcoming") return event.status === "upcoming";
    if (activeFilter === "past") return event.status === "past";
    if (activeFilter === "attending") return event.isAttending;
    return true;
  });

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleAttend = (eventId) => {
    // Toggle attendance
    console.log(`Toggled attendance for event ${eventId}`);
    alert(`You have registered for this event!`);
  };

  const handleEventDetails = (event) => {
    router.push({
      pathname: "/event-details",
      params: {
        eventId: event.id.toString(),
        title: event.title,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Cooperative Events</Text>
          <Text style={styles.headerSubtitle}>
            Join activities and grow together
          </Text>
        </View>
        <TouchableOpacity style={styles.notificationIcon}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
          <View style={styles.notificationBadge} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
      >
        {["all", "upcoming", "past", "attending"].map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              activeFilter === filter && styles.filterButtonActive,
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter === "all"
                ? "All Events"
                : filter === "upcoming"
                  ? "Upcoming"
                  : filter === "past"
                    ? "Past Events"
                    : "Attending"}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Events Count */}
      <View style={styles.eventsCount}>
        <Text style={styles.eventsCountText}>
          {filteredEvents.length}{" "}
          {filteredEvents.length === 1 ? "Event" : "Events"} Found
        </Text>
      </View>

      {/* Events List */}
      <ScrollView
        style={styles.eventsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredEvents.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => handleEventDetails(event)}
            activeOpacity={0.9}
          >
            {/* Event Image */}
            <View style={styles.eventImageContainer}>
              <Image
                source={{ uri: event.image }}
                style={styles.eventImage}
                resizeMode="cover"
              />
              <View
                style={[
                  styles.statusBadge,
                  event.status === "past"
                    ? styles.pastBadge
                    : styles.upcomingBadge,
                ]}
              >
                <Text style={styles.statusText}>
                  {event.status === "past" ? "Past" : "Upcoming"}
                </Text>
              </View>
            </View>

            {/* Event Content */}
            <View style={styles.eventContent}>
              <Text style={styles.eventTitle}>{event.title}</Text>
              <Text style={styles.eventDescription} numberOfLines={2}>
                {event.description}
              </Text>

              {/* Event Details */}
              <View style={styles.eventDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{event.date}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{event.time}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text style={styles.detailText}>{event.location}</Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.eventFooter}>
                <View style={styles.attendees}>
                  <Ionicons name="people" size={16} color="#4CAF50" />
                  <Text style={styles.attendeesText}>
                    {event.attendees} attending
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.attendButton,
                    event.isAttending && styles.attendingButton,
                  ]}
                  onPress={() => handleAttend(event.id)}
                >
                  <Ionicons
                    name={event.isAttending ? "checkmark" : "add"}
                    size={16}
                    color={event.isAttending ? "#fff" : "#4CAF50"}
                  />
                  <Text
                    style={[
                      styles.attendButtonText,
                      event.isAttending && styles.attendingButtonText,
                    ]}
                  >
                    {event.isAttending ? "Attending" : "Attend"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F9F9",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  notificationIcon: {
    position: "relative",
    padding: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF3B30",
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#4CAF50",
  },
  filterText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
  },
  eventsCount: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  eventsCountText: {
    fontSize: 14,
    color: "#666",
  },
  eventsList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  eventImageContainer: {
    height: 160,
    position: "relative",
  },
  eventImage: {
    width: "100%",
    height: "100%",
  },
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  upcomingBadge: {
    backgroundColor: "#4CAF50",
  },
  pastBadge: {
    backgroundColor: "#666",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  eventContent: {
    padding: 16,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  eventDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  eventDetails: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  detailText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
  eventFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  attendees: {
    flexDirection: "row",
    alignItems: "center",
  },
  attendeesText: {
    fontSize: 14,
    color: "#4CAF50",
    marginLeft: 6,
    fontWeight: "500",
  },
  attendButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: "#E8F5E8",
    borderWidth: 1,
    borderColor: "#4CAF50",
  },
  attendingButton: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  attendButtonText: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
    marginLeft: 6,
  },
  attendingButtonText: {
    color: "#fff",
  },
});
