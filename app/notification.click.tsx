import { Redirect } from 'expo-router';
import React from 'react';

export default function NotificationRedirect() {
    // Redirect to the player screen when this URL is hit
    return <Redirect href="/player" />;
}
