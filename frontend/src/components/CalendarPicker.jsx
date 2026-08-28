import { StyleSheet, Text, View, Pressable, Modal, ScrollView } from 'react-native'
import React, { useState, useEffect } from 'react'

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December']

export default function CalendarPicker({ visible, onClose, onSelect, initialDate = null, mode = 'future' }) {
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear]   = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState(null)
  const [showYearPicker, setShowYearPicker] = useState(false)

  // Generate Year list (1900 se lekar currentYear + 10 tak)
  const startYear = 1900
  const endYear = mode === 'dob' ? today.getFullYear() : today.getFullYear() + 10
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => endYear - i)

  useEffect(() => {
    if (initialDate) {
      setSelectedDate(initialDate)
      setCurrentMonth(initialDate.getMonth())
      setCurrentYear(initialDate.getFullYear())
    } else {
      setCurrentMonth(today.getMonth())
      setCurrentYear(today.getFullYear())
    }
    setShowYearPicker(false)
  }, [visible, initialDate])

  const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate()

  const getFirstDay = (month, year) => {
    const day = new Date(year, month, 1).getDay()
    return day === 0 ? 6 : day - 1
  }

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

  const isDisabled = (day) => {
    const date = new Date(currentYear, currentMonth, day)
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    if (mode === 'dob') {
      return date > todayStart
    }
    return date < todayStart
  }

  const daysInMonth = getDaysInMonth(currentMonth, currentYear)
  const firstDay    = getFirstDay(currentMonth, currentYear)
  const totalCells  = Math.ceil((firstDay + daysInMonth) / 7) * 7
  const cells       = Array.from({ length: totalCells }, (_, i) => {
    const day = i - firstDay + 1
    return day >= 1 && day <= daysInMonth ? day : null
  })

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.calendarBox} onPress={(e) => e.stopPropagation()}>

          {/* ── Month & Year Header ── */}
          <View style={styles.monthRow}>
            <Pressable style={styles.navBtn} onPress={handlePrevMonth}>
              <Text style={styles.navBtnText}>‹</Text>
            </Pressable>

            {/* Click here to toggle Quick Year Picker */}
            <Pressable
              style={styles.titleContainer}
              onPress={() => setShowYearPicker(prev => !prev)}
            >
              <Text style={styles.monthTitle}>
                {MONTHS[currentMonth]} {currentYear}
              </Text>
              <Text style={styles.dropdownArrow}>{showYearPicker ? '▲' : '▼'}</Text>
            </Pressable>

            <Pressable style={styles.navBtn} onPress={handleNextMonth}>
              <Text style={styles.navBtnText}>›</Text>
            </Pressable>
          </View>

          {/* ── Year Picker Grid Overlay ── */}
          {showYearPicker ? (
            <View style={styles.yearPickerContainer}>
              <Text style={styles.yearPickerHeading}>Select Year</Text>
              <ScrollView style={styles.yearScrollView} contentContainerStyle={styles.yearGrid}>
                {years.map((yr) => (
                  <Pressable
                    key={yr}
                    style={[
                      styles.yearItem,
                      yr === currentYear && styles.yearItemSelected,
                    ]}
                    onPress={() => {
                      setCurrentYear(yr)
                      setShowYearPicker(false)
                    }}
                  >
                    <Text
                      style={[
                        styles.yearItemText,
                        yr === currentYear && styles.yearItemTextSelected,
                      ]}
                    >
                      {yr}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ) : (
            <>
              {/* ── Day Headers ── */}
              <View style={styles.daysRow}>
                {DAYS.map((day) => (
                  <Text key={day} style={styles.dayHeader}>{day}</Text>
                ))}
              </View>

              {/* ── Date Grid ── */}
              <View style={styles.grid}>
                {cells.map((day, index) => {
                  const disabled = !day || isDisabled(day)
                  return (
                    <Pressable
                      key={index}
                      style={[
                        styles.cell,
                        day && isSelected(day) && styles.cellSelected,
                        day && isToday(day) && !isSelected(day) && styles.cellToday,
                        disabled && styles.cellDisabled,
                      ]}
                      onPress={() => day && !disabled && handleDateSelect(day)}
                      disabled={disabled}
                    >
                      <Text
                        style={[
                          styles.cellText,
                          day && isSelected(day) && styles.cellTextSelected,
                          day && isToday(day) && !isSelected(day) && styles.cellTextToday,
                          disabled && styles.cellTextDisabled,
                        ]}
                      >
                        {day || ''}
                      </Text>
                    </Pressable>
                  )
                })}
              </View>
            </>
          )}

          {/* ── Footer ── */}
          <View style={styles.footerRow}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.confirmBtn, !selectedDate && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              disabled={!selectedDate}
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
  backdrop: {
    flex: 1,
    backgroundColor: '#00000060',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: 400,
    gap: 16,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#F9FFFF',
  },
  dropdownArrow: {
    fontSize: 10,
    color: '#00A4A4',
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
  cellDisabled: {
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
  cellTextDisabled: {
    color: '#737373',
  },
  yearPickerContainer: {
    height: 250,
  },
  yearPickerHeading: {
    fontSize: 14,
    fontWeight: '600',
    color: '#737373',
    marginBottom: 8,
    textAlign: 'center',
  },
  yearScrollView: {
    flex: 1,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    paddingVertical: 4,
  },
  yearItem: {
    width: 76,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F9FFFF',
    borderWidth: 1,
    borderColor: '#00A4A420',
  },
  yearItemSelected: {
    backgroundColor: '#00A4A4',
    borderColor: '#00A4A4',
  },
  yearItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#001532',
  },
  yearItemTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
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