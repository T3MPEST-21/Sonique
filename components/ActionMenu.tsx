                                                                                                                                                                                                                                                                                                                                                                                import { COLORS } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export interface MenuItem {
  label: string;
  icon?: string;
  onPress: () => void;
  destructive?: boolean;
  rightElement?: React.ReactNode;
}

interface ActionMenuProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  items: MenuItem[];
}

const ActionMenu = ({ visible, onClose, title, items }: ActionMenuProps) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.menuContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{title || "Choose an Action"}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          </View>

          <ScrollView bounces={false} style={styles.itemList}>
            {items.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  index === items.length - 1 && { borderBottomWidth: 0 },
                ]}
                onPress={() => {
                  item.onPress();
                  onClose();
                }}
              >
                <View style={styles.itemMain}>
                  {item.icon && (
                    <Ionicons
                      name={item.icon as any}
                      size={22}
                      color={item.destructive ? "#ff4757" : COLORS.primary}
                      style={styles.itemIcon}
                    />
                  )}
                  <Text
                    style={[
                      styles.itemLabel,
                      item.destructive && { color: "#ff4757" },
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
                {item.rightElement}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuContainer: {
    width: width * 0.85,
    maxHeight: height * 0.7,
    backgroundColor: "#1E1E2E",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFF",
  },
  closeButton: {
    padding: 4,
  },
  itemList: {
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.03)",
  },
  itemMain: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemIcon: {
    marginRight: 15,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
  },
});

export default ActionMenu;
