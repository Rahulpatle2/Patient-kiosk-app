import { StyleSheet, Text, View, Pressable, Modal } from 'react-native'
import React, { useState } from 'react'

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December']

export default function CalendarPicker({ visible, onClose, onSelect }) {

  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear]   = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState(null)

  // ─── Get days in month ────────────────────────────────────
  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate()

  // ─── Get first day of month (0=Sun, 1=Mon...) ─────────────
  const getFirstDay = (month, year) => {
    const day = new Date(year, month, 1).getDay()
    return day === 0 ? 6 : day - 1 // Convert to Mon=0 format
  }

  // ─── Handlers ─────────────────────────────────────────────
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(prev => prev - 1)
    } else {
      setCurrentMonth(prev => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(prev => prev + 1)
    } else {
      setCurrentMonth(prev => prev + 1)
    }
  }

  const handleDateSelect = (day) => {
    const date = new Date(currentYear, currentMonth, day)
    setSelectedDate(date)
  }

  const handleConfirm = () => {
    if (selectedDate) {
      onSelect(selectedDate)
      onClose()
    }
  }

  const isToday = (day) => {
    return day === today.getDate() &&
           currentMonth === today.getMonth() &&
           currentYear === today.getFullYear()
  }

  const isSelected = (day) => {
    if (!selectedDate) return false
    return day === selectedDate.getDate() &&
           currentMonth === selectedDate.getMonth() &&
           currentYear === selectedDate.getFullYear()
  }

  const isPast = (day) => {
    const date = new Date(currentYear, currentMonth, day)
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    return date < todayStart
  }

  // ─── Build calendar grid ──────────────────────────────────
  const daysInMonth = getDaysInMonth(currentMonth, currentYear)
  const firstDay    = getFirstDay(currentMonth, currentYear)
  const totalCells  = Math.ceil((firstDay + daysInMonth) / 7) * 7
  const cells       = Array.from({ length: totalCells }, (_, i) => {
    const day = i - firstDay + 1
    return day >= 1 && day <= daysInMonth ? day : null
  })

  // ─── Render ───────────────────────────────────────────────
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>

        {/* Calendar Box */}
        <Pressable style={styles.calendarBox} onPress={() => {}}>

          {/* ── Month Navigation ── */}
          <View style={styles.monthRow}>
            <Pressable style={styles.navBtn} onPress={handlePrevMonth}>
              <Text style={styles.navBtnText}>‹</Text>
            </Pressable>
            <Text style={styles.monthTitle}>
              {MONTHS[currentMonth]} {currentYear}
            </Text>
            <Pressable style={styles.navBtn} onPress={handleNextMonth}>
              <Text style={styles.navBtnText}>›</Text>
            </Pressable>
          </View>

          {/* ── Day Headers ── */}
          <View style={styles.daysRow}>
            {DAYS.map((day) => (
              <Text key={day} style={styles.dayHeader}>{day}</Text>
            ))}
          </View>

          {/* ── Date Grid ── */}
          <View style={styles.grid}>
            {cells.map((day, index) => (
              <Pressable
                key={index}
                style={[
                  styles.cell,
                  day && isSelected(day) && styles.cellSelected,
                  day && isToday(day) && !isSelected(day) && styles.cellToday,
                  day && isPast(day) && styles.cellPast,
                ]}
                onPress={() => day && !isPast(day) && handleDateSelect(day)}
                disabled={!day || isPast(day)}
              >
                <Text style={[
                  styles.cellText,
                  day && isSelected(day) && styles.cellTextSelected,
                  day && isToday(day) && !isSelected(day) && styles.cellTextToday,
                  day && isPast(day) && styles.cellTextPast,
                ]}>
                  {day || ''}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* ── Footer Buttons ── */}
          <View style={styles.footerRow}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmBtn, !selectedDate && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
            >
              <Text style={styles.confirmBtnText}>Confirm</Text>
            </Pressable>
          </View>

        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({

  // Backdrop
  backdrop: {
    flex: 1,
    backgroundColor: '#00000060',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Calendar Box
  calendarBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: 400,
    gap: 16,
    boxShadow: '0px 8px 24px rgba(0,0,0,0.15)',
  },

  // Month Navigation
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FFFF',
    borderWidth: 1,
    borderColor: '#00A4A440',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navBtnText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#00A4A4',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#001532',
  },

  // Day Headers
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayHeader: {
    width: 48,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: '#737373',
  },

  // Date Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  cell: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellSelected: {
    backgroundColor: '#00A4A4',
  },
  cellToday: {
    borderWidth: 2,
    borderColor: '#00A4A4',
  },
  cellPast: {
    opacity: 0.3,
  },
  cellText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#001532',
  },
  cellTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  cellTextToday: {
    color: '#00A4A4',
    fontWeight: '700',
  },
  cellTextPast: {
    color: '#737373',
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#73737340',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#737373',
  },
  confirmBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#00A4A4',
  },
  confirmBtnDisabled: {
    backgroundColor: '#73737340',
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },

})