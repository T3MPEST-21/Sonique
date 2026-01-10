/**
 * Mood Detector Music App Color Palette
 * These colors are used consistently across all screens to ensure a cohesive UI.
 */

export const COLORS = {
  // Primary brand color used for action buttons (Offline/Online mode), 
  // active tab icons, and mood selection highlights.
  primary: '#6C63FF', 

  // Background colors
  backgroundLight: '#FFFFFF', // Used for main screen backgrounds in Light Mode
  backgroundDark: '#121212',  // Used for main screen backgrounds in Dark Mode
  
  // Surface colors (cards, modals, and list items)
  surfaceLight: '#F5F5F7',    // Used for playlist cards and music list items in Light Mode
  surfaceDark: '#1E1E1E',     // Used for the Music Player Modal and cards in Dark Mode

  // Text colors
  textPrimaryLight: '#1A1A1B', // Main headings and titles in Light Mode
  textSecondaryLight: '#65676B', // Subtitles and artist names in Light Mode
  textPrimaryDark: '#FFFFFF',    // Main headings and titles in Dark Mode
  textSecondaryDark: '#B0B3B8',  // Subtitles and artist names in Dark Mode

  // Interaction & Status
  toggleActive: '#34C759',    // Used for the 'Online' status and active toggle switches
  toggleInactive: '#E9E9EA',  // Used for the 'Offline' status and inactive toggle tracks
  border: '#E0E0E0',          // Used for separators between music tracks and input field borders
};

/**
 * Usage Examples:
 * - 'primary': "Offline/Online" buttons at the top of the Home Screen.
 * - 'surfaceDark': The background of the "Music Player Modal".
 * - 'textSecondaryLight': The artist name in the "Music List".
 */