import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

// ─── Hamburger Icon ──────────────────────────────────────────────────────────
export function HamburgerIcon({ color = '#1E293B' }: { color?: string }) {
  return (
    <View style={iconStyles.hamburgerWrap}>
      <View style={[iconStyles.hamburgerLine, { backgroundColor: color }]} />
      <View style={[iconStyles.hamburgerLine, { backgroundColor: color }]} />
      <View style={[iconStyles.hamburgerLine, { backgroundColor: color }]} />
    </View>
  );
}

// ─── Filter / Sliders Icon ───────────────────────────────────────────────────
export function FilterIcon({ color = '#1E293B' }: { color?: string }) {
  return (
    <View style={iconStyles.filterWrap}>
      {/* Top track + slider knob on left */}
      <View style={iconStyles.filterRow}>
        <View style={[iconStyles.filterTrack, { backgroundColor: color }]} />
        <View style={[iconStyles.filterKnob, { left: 3, borderColor: color, backgroundColor: '#FFF' }]} />
      </View>
      {/* Middle track + slider knob on right */}
      <View style={iconStyles.filterRow}>
        <View style={[iconStyles.filterTrack, { backgroundColor: color }]} />
        <View style={[iconStyles.filterKnob, { right: 3, borderColor: color, backgroundColor: '#FFF' }]} />
      </View>
      {/* Bottom track + slider knob in center */}
      <View style={iconStyles.filterRow}>
        <View style={[iconStyles.filterTrack, { backgroundColor: color }]} />
        <View style={[iconStyles.filterKnob, { left: 8, borderColor: color, backgroundColor: '#FFF' }]} />
      </View>
    </View>
  );
}

// ─── Magnifier / Search Icon ────────────────────────────────────────────────
export function SearchIcon({ color = '#94A3B8', size = 19 }: { color?: string; size?: number }) {
  const circleSize = size * 0.68;
  return (
    <View style={[iconStyles.searchWrap, { width: size, height: size }]}>
      <View
        style={[
          iconStyles.searchCircle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            borderColor: color,
          },
        ]}
      />
      <View
        style={[
          iconStyles.searchStem,
          {
            backgroundColor: color,
            height: size * 0.38,
            right: 1,
            bottom: 1,
          },
        ]}
      />
    </View>
  );
}

// ─── Home Icon (Outline / Thin-line vector matching other icons) ─────────────
export function HomeIcon({ color = '#64748B', size = 20 }: { color?: string; size?: number }) {
  const roofW = size * 0.95;
  const roofH = size * 0.44;
  const bodyW = size * 0.72;
  const bodyH = size * 0.46;
  const doorW = size * 0.28;
  const doorH = size * 0.28;

  return (
    <View style={[iconStyles.homeWrap, { width: size, height: size }]}>
      {/* Roof peak triangle outline using two angled struts */}
      <View style={{ width: roofW, height: roofH, alignItems: 'center', justifyContent: 'flex-end', position: 'relative' }}>
        {/* Left slant */}
        <View
          style={{
            position: 'absolute',
            left: roofW * 0.08,
            top: 2,
            width: roofW * 0.52,
            height: 1.8,
            backgroundColor: color,
            borderRadius: 1,
            transform: [{ rotate: '-38deg' }],
          }}
        />
        {/* Right slant */}
        <View
          style={{
            position: 'absolute',
            right: roofW * 0.08,
            top: 2,
            width: roofW * 0.52,
            height: 1.8,
            backgroundColor: color,
            borderRadius: 1,
            transform: [{ rotate: '38deg' }],
          }}
        />
      </View>

      {/* House Body (Outline box) */}
      <View
        style={{
          width: bodyW,
          height: bodyH,
          borderWidth: 1.8,
          borderTopWidth: 0,
          borderColor: color,
          borderBottomLeftRadius: 3,
          borderBottomRightRadius: 3,
          alignItems: 'center',
          justifyContent: 'flex-end',
          marginTop: -2,
        }}>
        {/* Doorway outline */}
        <View
          style={{
            width: doorW,
            height: doorH,
            borderWidth: 1.6,
            borderBottomWidth: 0,
            borderColor: color,
            borderTopLeftRadius: 2.5,
            borderTopRightRadius: 2.5,
          }}
        />
      </View>
    </View>
  );
}

// ─── Bell / Alerts Icon (Outline) ───────────────────────────────────────────
export function BellIcon({ color = '#64748B', size = 20 }: { color?: string; size?: number }) {
  return (
    <View style={[iconStyles.bellWrap, { width: size, height: size }]}>
      {/* Top handle */}
      <View style={[iconStyles.bellTop, { backgroundColor: color }]} />
      {/* Bell body dome */}
      <View
        style={[
          iconStyles.bellDome,
          {
            borderColor: color,
            width: size * 0.72,
            height: size * 0.60,
          },
        ]}
      />
      {/* Bell bottom rim */}
      <View style={[iconStyles.bellRim, { backgroundColor: color, width: size * 0.82 }]} />
      {/* Clapper */}
      <View style={[iconStyles.bellClapper, { backgroundColor: color }]} />
    </View>
  );
}

// ─── Profile / User Icon (Outline) ──────────────────────────────────────────
export function ProfileIcon({ color = '#64748B', size = 20 }: { color?: string; size?: number }) {
  const headSize = size * 0.40;
  return (
    <View style={[iconStyles.profileWrap, { width: size, height: size }]}>
      {/* Head */}
      <View
        style={[
          iconStyles.profileHead,
          {
            width: headSize,
            height: headSize,
            borderRadius: headSize / 2,
            borderColor: color,
          },
        ]}
      />
      {/* Shoulders arch */}
      <View
        style={[
          iconStyles.profileShoulders,
          {
            width: size * 0.80,
            height: size * 0.36,
            borderTopLeftRadius: size * 0.42,
            borderTopRightRadius: size * 0.42,
            borderColor: color,
          },
        ]}
      />
    </View>
  );
}

// ─── Apple Icon ─────────────────────────────────────────────────────────────
export function AppleIcon({ color = '#FFFFFF', size = 20 }: { color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Leaf */}
      <View
        style={{
          width: size * 0.32,
          height: size * 0.22,
          backgroundColor: color,
          borderTopRightRadius: size * 0.3,
          borderBottomLeftRadius: size * 0.3,
          marginBottom: -1,
          marginLeft: 3,
        }}
      />
      {/* Body */}
      <View
        style={{
          width: size * 0.78,
          height: size * 0.72,
          backgroundColor: color,
          borderRadius: size * 0.36,
          borderBottomLeftRadius: size * 0.38,
          borderBottomRightRadius: size * 0.38,
          position: 'relative',
        }}>
        {/* Bite notch cutout */}
        <View
          style={{
            position: 'absolute',
            right: -size * 0.15,
            top: size * 0.16,
            width: size * 0.34,
            height: size * 0.34,
            borderRadius: size * 0.17,
            backgroundColor: color === '#FFFFFF' ? '#0F172A' : '#FFFFFF',
          }}
        />
      </View>
    </View>
  );
}

// ─── Google Icon ────────────────────────────────────────────────────────────
export function GoogleIcon({ size = 20 }: { size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
      {/* Google G Emblem */}
      <View
        style={{
          width: size * 0.88,
          height: size * 0.88,
          borderRadius: (size * 0.88) / 2,
          borderWidth: 2.8,
          borderColor: '#4285F4',
          borderLeftColor: '#FBBC05',
          borderBottomColor: '#34A853',
          borderTopColor: '#EA4335',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {/* Inward crossbar */}
        <View
          style={{
            position: 'absolute',
            right: -1,
            width: size * 0.4,
            height: 2.4,
            backgroundColor: '#4285F4',
          }}
        />
      </View>
    </View>
  );
}

// ─── Camera Icon (Modern Vector) ──────────────────────────────────────────
export function CameraIcon({ color = '#FFFFFF', size = 14 }: { color?: string; size?: number }) {
  const bodyW = size;
  const bodyH = size * 0.72;
  const lensSize = size * 0.42;

  return (
    <View style={[iconStyles.cameraWrap, { width: size, height: size }]}>
      {/* Top Notch */}
      <View
        style={[
          iconStyles.cameraNotch,
          {
            width: size * 0.32,
            height: size * 0.16,
            backgroundColor: color,
            borderTopLeftRadius: 1.5,
            borderTopRightRadius: 1.5,
            marginBottom: -0.5,
          },
        ]}
      />
      {/* Camera Body */}
      <View
        style={[
          iconStyles.cameraBody,
          {
            width: bodyW,
            height: bodyH,
            borderColor: color,
            borderWidth: 1.5,
            borderRadius: 3.5,
          },
        ]}>
        {/* Center Lens */}
        <View
          style={[
            iconStyles.cameraLens,
            {
              width: lensSize,
              height: lensSize,
              borderRadius: lensSize / 2,
              borderColor: color,
              borderWidth: 1.3,
            },
          ]}
        />
        {/* Flash Dot */}
        <View
          style={[
            iconStyles.cameraDot,
            {
              backgroundColor: color,
              width: 1.8,
              height: 1.8,
              borderRadius: 0.9,
            },
          ]}
        />
      </View>
    </View>
  );
}

// ─── Heart / Favorite Icon ──────────────────────────────────────────────────
export function HeartIcon({
  color = '#EF4444',
  size = 18,
  filled = false,
}: {
  color?: string;
  size?: number;
  filled?: boolean;
}) {
  const lobeSize = size * 0.54;
  const bottomSquareSize = size * 0.48;

  if (filled) {
    return (
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: size, height: size, position: 'relative' }}>
          {/* Left circle lobe */}
          <View
            style={{
              position: 'absolute',
              width: lobeSize,
              height: lobeSize,
              borderRadius: lobeSize / 2,
              backgroundColor: color,
              top: size * 0.08,
              left: size * 0.06,
            }}
          />
          {/* Right circle lobe */}
          <View
            style={{
              position: 'absolute',
              width: lobeSize,
              height: lobeSize,
              borderRadius: lobeSize / 2,
              backgroundColor: color,
              top: size * 0.08,
              right: size * 0.06,
            }}
          />
          {/* Bottom rotated square filling heart shape */}
          <View
            style={{
              position: 'absolute',
              width: bottomSquareSize,
              height: bottomSquareSize,
              backgroundColor: color,
              transform: [{ rotate: '45deg' }],
              bottom: size * 0.12,
              left: (size - bottomSquareSize) / 2,
              borderRadius: 2,
            }}
          />
        </View>
      </View>
    );
  }

  // Outline heart
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: size, height: size, position: 'relative' }}>
        {/* Left lobe outline */}
        <View
          style={{
            position: 'absolute',
            width: lobeSize,
            height: lobeSize,
            borderRadius: lobeSize / 2,
            borderWidth: 1.8,
            borderColor: color,
            borderBottomWidth: 0,
            borderRightWidth: 0,
            top: size * 0.08,
            left: size * 0.06,
            transform: [{ rotate: '-15deg' }],
          }}
        />
        {/* Right lobe outline */}
        <View
          style={{
            position: 'absolute',
            width: lobeSize,
            height: lobeSize,
            borderRadius: lobeSize / 2,
            borderWidth: 1.8,
            borderColor: color,
            borderBottomWidth: 0,
            borderLeftWidth: 0,
            top: size * 0.08,
            right: size * 0.06,
            transform: [{ rotate: '15deg' }],
          }}
        />
        {/* Bottom V outline */}
        <View
          style={{
            position: 'absolute',
            width: bottomSquareSize,
            height: bottomSquareSize,
            borderBottomWidth: 1.8,
            borderRightWidth: 1.8,
            borderColor: color,
            transform: [{ rotate: '45deg' }],
            bottom: size * 0.14,
            left: (size - bottomSquareSize) / 2,
            borderBottomRightRadius: 2,
          }}
        />
      </View>
    </View>
  );
}

// ─── Moon / Dark Mode Icon ──────────────────────────────────────────────────
export function MoonIcon({ color = '#38BDF8', size = 20 }: { color?: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        position: 'relative',
        overflow: 'hidden',
      }}>
      {/* Cutout to form crescent */}
      <View
        style={{
          position: 'absolute',
          top: -size * 0.12,
          right: -size * 0.12,
          width: size * 0.78,
          height: size * 0.78,
          borderRadius: (size * 0.78) / 2,
          backgroundColor: '#151D2F',
        }}
      />
    </View>
  );
}

// ─── Sun / Light Mode Icon ──────────────────────────────────────────────────
export function SunIcon({ color = '#F59E0B', size = 20 }: { color?: string; size?: number }) {
  const centerSize = size * 0.44;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Sun Center */}
      <View
        style={{
          width: centerSize,
          height: centerSize,
          borderRadius: centerSize / 2,
          backgroundColor: color,
        }}
      />
      {/* Rays */}
      <View
        style={{
          position: 'absolute',
          width: size * 0.88,
          height: 1.8,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
      <View
        style={{
          position: 'absolute',
          height: size * 0.88,
          width: 1.8,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size * 0.88,
          height: 1.8,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: '45deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          width: size * 0.88,
          height: 1.8,
          backgroundColor: color,
          borderRadius: 1,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

// ─── Settings / Sliders Icon ────────────────────────────────────────────────
export function SettingsIcon({ color = '#64748B', size = 20 }: { color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* 3 horizontal track rows with offset knobs */}
      <View style={{ width: size * 0.9, height: size * 0.75, justifyContent: 'space-between' }}>
        <View style={{ height: 2, backgroundColor: color, borderRadius: 1, position: 'relative', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', left: size * 0.2, width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
        </View>
        <View style={{ height: 2, backgroundColor: color, borderRadius: 1, position: 'relative', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', right: size * 0.2, width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
        </View>
        <View style={{ height: 2, backgroundColor: color, borderRadius: 1, position: 'relative', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', left: size * 0.5, width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
        </View>
      </View>
    </View>
  );
}

// ─── Chevron Right Icon ─────────────────────────────────────────────────────
export function ChevronRightIcon({ color = '#94A3B8', size = 16 }: { color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.45,
          height: size * 0.45,
          borderTopWidth: 2,
          borderRightWidth: 2,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
          marginLeft: -size * 0.15,
        }}
      />
    </View>
  );
}

// ─── Check Icon ─────────────────────────────────────────────────────────────
export function CheckIcon({ color = '#0096C7', size = 18 }: { color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.55,
          height: size * 0.32,
          borderBottomWidth: 2.2,
          borderLeftWidth: 2.2,
          borderColor: color,
          transform: [{ rotate: '-45deg' }],
          marginTop: -size * 0.12,
        }}
      />
    </View>
  );
}

// ─── Sparkles / AI Icon ─────────────────────────────────────────────────────
export function SparklesIcon({ color = '#F59E0B', size = 18 }: { color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size * 0.6,
          height: size * 0.6,
          backgroundColor: color,
          transform: [{ rotate: '45deg' }],
          borderRadius: 2,
        }}
      />
    </View>
  );
}

// ─── Clock / Timer Icon ─────────────────────────────────────────────────────
export function ClockIcon({ color = '#D97706', size = 18 }: { color?: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.8,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}>
      {/* Minute hand pointing up */}
      <View
        style={{
          position: 'absolute',
          top: size * 0.18,
          width: 1.8,
          height: size * 0.35,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
      {/* Hour hand pointing right */}
      <View
        style={{
          position: 'absolute',
          right: size * 0.18,
          height: 1.8,
          width: size * 0.28,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
    </View>
  );
}

// ─── Lock Icon ─────────────────────────────────────────────────────────────
export function LockIcon({ color = '#0096C7', size = 22 }: { color?: string; size?: number }) {
  const bodyW = size * 0.8;
  const bodyH = size * 0.55;
  const shackleW = size * 0.5;
  const shackleH = size * 0.45;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end', position: 'relative' }}>
      {/* Shackle */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          width: shackleW,
          height: shackleH,
          borderTopLeftRadius: shackleW / 2,
          borderTopRightRadius: shackleW / 2,
          borderWidth: 2,
          borderColor: color,
          borderBottomWidth: 0,
        }}
      />
      {/* Body */}
      <View
        style={{
          width: bodyW,
          height: bodyH,
          backgroundColor: color,
          borderRadius: 4,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View style={{ width: 3, height: 4, backgroundColor: '#FFFFFF', borderRadius: 1 }} />
      </View>
    </View>
  );
}

// ─── Help / Info Icon ───────────────────────────────────────────────────────
export function HelpCircleIcon({ color = '#64748B', size = 18 }: { color?: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: 1.8,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ color, fontSize: size * 0.58, fontWeight: '800', marginTop: -1 }}>?</Text>
    </View>
  );
}

// ─── Logout Icon ────────────────────────────────────────────────────────────
export function LogoutIcon({ color = '#EF4444', size = 18 }: { color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
      {/* Open door box on left */}
      <View
        style={{
          position: 'absolute',
          left: 1,
          width: size * 0.52,
          height: size * 0.85,
          borderWidth: 1.8,
          borderRightWidth: 0,
          borderColor: color,
          borderRadius: 2.5,
        }}
      />
      {/* Arrow shaft pointing right */}
      <View
        style={{
          position: 'absolute',
          right: 0,
          width: size * 0.65,
          height: 1.8,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
      {/* Arrow head */}
      <View
        style={{
          position: 'absolute',
          right: 0,
          width: size * 0.3,
          height: size * 0.3,
          borderTopWidth: 1.8,
          borderRightWidth: 1.8,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

// ─── Plus / Add Icon ────────────────────────────────────────────────────────
export function PlusIcon({ color = '#FFFFFF', size = 18 }: { color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          width: size * 0.75,
          height: 2,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
      <View
        style={{
          position: 'absolute',
          height: size * 0.75,
          width: 2,
          backgroundColor: color,
          borderRadius: 1,
        }}
      />
    </View>
  );
}

// ─── Document / Note Icon ───────────────────────────────────────────────────
export function DocumentIcon({ color = '#0096C7', size = 18 }: { color?: string; size?: number }) {
  return (
    <View
      style={{
        width: size * 0.75,
        height: size,
        borderWidth: 1.8,
        borderColor: color,
        borderRadius: 3,
        padding: 2,
        justifyContent: 'space-around',
        alignItems: 'flex-start',
      }}>
      <View style={{ width: '80%', height: 1.5, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: '60%', height: 1.5, backgroundColor: color, borderRadius: 1 }} />
      <View style={{ width: '70%', height: 1.5, backgroundColor: color, borderRadius: 1 }} />
    </View>
  );
}

// ─── Trash / Delete Icon ────────────────────────────────────────────────────
export function TrashIcon({ color = '#EF4444', size = 18 }: { color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Lid */}
      <View style={{ width: size * 0.75, height: 1.8, backgroundColor: color, borderRadius: 1, marginBottom: 1 }} />
      {/* Bin Body */}
      <View
        style={{
          width: size * 0.62,
          height: size * 0.62,
          borderWidth: 1.8,
          borderTopWidth: 0,
          borderColor: color,
          borderBottomLeftRadius: 3,
          borderBottomRightRadius: 3,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 2,
        }}>
        <View style={{ width: 1.2, height: size * 0.35, backgroundColor: color }} />
        <View style={{ width: 1.2, height: size * 0.35, backgroundColor: color }} />
      </View>
    </View>
  );
}

// ─── Edit / Pencil Icon ─────────────────────────────────────────────────────
export function EditIcon({ color = '#64748B', size = 18 }: { color?: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '45deg' }],
      }}>
      <View
        style={{
          width: size * 0.35,
          height: size * 0.75,
          borderWidth: 1.8,
          borderColor: color,
          borderRadius: 2,
        }}
      />
    </View>
  );
}

// ─── Minimalist Category Icons (Replacing Emojis) ───────────────────────────
export function FolderIcon({ color = '#64748B', size = 18 }: { color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size * 0.78, position: 'relative' }}>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size * 0.45,
          height: size * 0.3,
          backgroundColor: color,
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: size * 0.65,
          borderWidth: 1.8,
          borderColor: color,
          borderRadius: 2.5,
        }}
      />
    </View>
  );
}

export function ImageIcon({ color = '#64748B', size = 18 }: { color?: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size * 0.82,
        borderWidth: 1.8,
        borderColor: color,
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden',
      }}>
      <View
        style={{
          position: 'absolute',
          top: 2,
          right: 3,
          width: size * 0.22,
          height: size * 0.22,
          borderRadius: size * 0.11,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: -2,
          left: 2,
          width: size * 0.5,
          height: size * 0.5,
          borderTopWidth: 1.8,
          borderRightWidth: 1.8,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

export function PenIcon({ color = '#64748B', size = 18 }: { color?: string; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '-45deg' }],
      }}>
      <View
        style={{
          width: size * 0.28,
          height: size * 0.72,
          borderWidth: 1.8,
          borderColor: color,
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
          borderBottomLeftRadius: 1,
          borderBottomRightRadius: 1,
        }}
      />
    </View>
  );
}

export function CodeIcon({ color = '#64748B', size = 18 }: { color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 1 }}>
      <Text style={{ color, fontSize: size * 0.65, fontWeight: '800' }}>‹</Text>
      <Text style={{ color, fontSize: size * 0.65, fontWeight: '800' }}>›</Text>
    </View>
  );
}

export function BriefcaseIcon({ color = '#64748B', size = 18 }: { color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size * 0.8, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: size * 0.4, height: 2, borderWidth: 1.5, borderBottomWidth: 0, borderColor: color, borderTopLeftRadius: 2, borderTopRightRadius: 2, marginBottom: -0.5 }} />
      <View
        style={{
          width: size,
          height: size * 0.65,
          borderWidth: 1.8,
          borderColor: color,
          borderRadius: 3,
        }}
      />
    </View>
  );
}

export function ChartIcon({ color = '#64748B', size = 18 }: { color?: string; size?: number }) {
  return (
    <View style={{ width: size, height: size * 0.8, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 1 }}>
      <View style={{ width: size * 0.22, height: size * 0.35, backgroundColor: color, borderRadius: 1.5 }} />
      <View style={{ width: size * 0.22, height: size * 0.6, backgroundColor: color, borderRadius: 1.5 }} />
      <View style={{ width: size * 0.22, height: size * 0.8, backgroundColor: color, borderRadius: 1.5 }} />
    </View>
  );
}

const iconStyles = StyleSheet.create({
  // Camera
  cameraWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraNotch: {
    alignSelf: 'center',
  },
  cameraBody: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cameraLens: {
    backgroundColor: 'transparent',
  },
  cameraDot: {
    position: 'absolute',
    top: 1.5,
    right: 2,
  },

  // Hamburger
  hamburgerWrap: {
    width: 20,
    height: 14,
    justifyContent: 'space-between',
  },
  hamburgerLine: {
    width: 20,
    height: 2,
    borderRadius: 1,
  },

  // Filter
  filterWrap: {
    width: 20,
    height: 18,
    justifyContent: 'space-between',
  },
  filterRow: {
    width: 20,
    height: 4,
    justifyContent: 'center',
    position: 'relative',
  },
  filterTrack: {
    width: '100%',
    height: 1.6,
    borderRadius: 1,
  },
  filterKnob: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1.5,
  },

  // Search
  searchWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCircle: {
    position: 'absolute',
    top: 1,
    left: 1,
    borderWidth: 1.8,
    backgroundColor: 'transparent',
  },
  searchStem: {
    position: 'absolute',
    width: 1.8,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },

  // Home
  homeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bell
  bellWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellTop: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1.25,
    marginBottom: -1,
  },
  bellDome: {
    borderWidth: 1.8,
    borderBottomWidth: 0,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
  },
  bellRim: {
    height: 1.8,
    borderRadius: 1,
  },
  bellClapper: {
    width: 3.5,
    height: 2.5,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
    marginTop: 0.5,
  },

  // Profile
  profileWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHead: {
    borderWidth: 1.8,
    backgroundColor: 'transparent',
    marginBottom: 1.5,
  },
  profileShoulders: {
    borderWidth: 1.8,
    borderBottomWidth: 0,
    backgroundColor: 'transparent',
  },
});
