import { defaultStyles } from "@/styles";
import { Stack } from "expo-router";
import { View } from "react-native";

const ArtistsScreenLayout = () => {
  return (
    <View style={defaultStyles.container}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="[name]"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </View>
  );
};

export default ArtistsScreenLayout;
