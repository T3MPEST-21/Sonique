import { defaultStyles } from "@/styles";
import { Stack } from "expo-router";
import { View } from "react-native";
import { StackScreenOptions } from "../../../constants/_layout";

const FavoritesScreenLayout = () => {
  return (
    <View style={defaultStyles.container}>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            ...StackScreenOptions,
            headerTitle: "",
          }}
        />
      </Stack>
    </View>
  );
};

export default FavoritesScreenLayout;
