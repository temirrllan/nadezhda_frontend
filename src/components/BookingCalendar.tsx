import { useState, useEffect } from "react";
import "./BookingCalendar.css"

interface BookingCalendarProps {
  costumeId: string;
  size?: string;
  selectedDate?: string;
  onDateSelect: (date: string) => void;
}

export default function BookingCalendar({
  costumeId,
  size,
  selectedDate,
  onDateSelect,
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [pendingDate, setPendingDate] = useState<string | null>(null);

  useEffect(() => {
    if (size) {
      loadBookedDates();
    }
  }, [costumeId, size, currentMonth]);

  const loadBookedDates = async () => {
    if (!size) {
      console.log("⚠️ [CALENDAR] Размер не выбран, пропускаем загрузку");
      setBookedDates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000";
      const url = `${API_BASE}/api/costumes/${costumeId}/booked-dates?size=${size}`;

      console.log(`📅 [CALENDAR] Загружаем забронированные даты для размера ${size}...`);
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      
      const data = await res.json();
      const dates = data.map((d: any) => d.date);
      
      setBookedDates(dates);
      
      console.log(`✅ [CALENDAR] Загружено забронированных дат: ${dates.length}`);
      if (dates.length > 0) {
        console.log(`🔴 [CALENDAR] Забронированные даты:`, dates);
      }
    } catch (err) {
      console.error("❌ [CALENDAR] Ошибка загрузки занятых дат:", err);
      setBookedDates([]);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const formatDate = (year: number, month: number, day: number) => {
    const m = String(month + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    return `${year}-${m}-${d}`;
  };

  const isDateBooked = (dateStr: string) => {
    return bookedDates.includes(dateStr);
  };

  const isDatePast = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleDateClick = (dateStr: string) => {
    if (isDatePast(dateStr)) {
      alert("⚠️ Нельзя выбрать прошедшую дату");
      return;
    }

    if (isDateBooked(dateStr)) {
      const formattedDate = new Date(dateStr).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      alert(`❌ К сожалению, все костюмы этого размера заняты на ${formattedDate}.\n\nПожалуйста, выберите другой день.`);
      return;
    }

    setPendingDate(dateStr);
    setShowModal(true);
  };

  const confirmDateSelection = () => {
    if (pendingDate) {
      onDateSelect(pendingDate);
      setShowModal(false);
      setPendingDate(null);
    }
  };

  const cancelDateSelection = () => {
    setShowModal(false);
    setPendingDate(null);
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const monthNames = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"
  ];

  const days = [];
  
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(year, month, day);
    const isBooked = isDateBooked(dateStr);
    const isPast = isDatePast(dateStr);
    const isSelected = dateStr === selectedDate;

    let className = "calendar-day";
    if (isBooked) className += " booked";
    if (isPast) className += " past";
    if (isSelected && !isBooked) className += " selected"; // Не показываем selected для забронированных

    days.push(
      <div
        key={day}
        className={className}
        onClick={() => handleDateClick(dateStr)}
        title={
          isBooked 
            ? `❌ Занято (${new Date(dateStr).toLocaleDateString("ru-RU")})` 
            : isPast 
            ? "Прошедшая дата" 
            : `Выбрать ${new Date(dateStr).toLocaleDateString("ru-RU")}`
        }
      >
        {day}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="calendar-container">
        <div className="calendar-loading">Загрузка календаря...</div>
      </div>
    );
  }

  const formatModalDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", { 
      day: "numeric", 
      month: "long", 
      year: "numeric",
      weekday: "long"
    });
  };

  const getPickupDate = (eventDateStr: string) => {
    const eventDate = new Date(eventDateStr);
    const pickup = new Date(eventDate);
    pickup.setDate(pickup.getDate() - 1);
    return pickup.toLocaleDateString("ru-RU", { 
      day: "numeric", 
      month: "long",
      weekday: "short"
    });
  };

  return (
    <>
      {/* Модальное окно с правилами */}
      {showModal && pendingDate && (
        <div 
          className="modal-overlay"
          onClick={cancelDateSelection}
        >
          <div 
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-icon">📅</div>

            <h3 className="modal-title">Правила аренды</h3>

            <div className="modal-body">
              <p className="modal-event-date">
                🎭 Дата мероприятия:<br />
                <span className="highlight-blue">
                  {formatModalDate(pendingDate)}
                </span>
              </p>

              <div className="modal-info-box pickup">
                <p className="info-label">📦 Выдача костюма:</p>
                <p className="info-value">
                  {getPickupDate(pendingDate)}<br />
                  с 17:00 до 19:00
                </p>
              </div>

              <div className="modal-info-box return">
                <p className="info-label">🔄 Возврат костюма:</p>
                <p className="info-value">
                  {formatModalDate(pendingDate).split(',')[0]}<br />
                  до 17:00
                </p>
              </div>

              <div className="modal-warning">
                <p>⚠️ При нарушении сроков возврата предусмотрен штраф</p>
              </div>
            </div>

            <div className="modal-actions">
              <button 
                className="modal-btn confirm"
                onClick={confirmDateSelection}
              >
                ✓ Понятно, продолжить
              </button>
              <button 
                className="modal-btn cancel"
                onClick={cancelDateSelection}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="calendar-container">
        <div className="calendar-header">
          <button className="calendar-nav" onClick={prevMonth} aria-label="Предыдущий месяц">
            ‹
          </button>
          <div className="calendar-title">
            {monthNames[month]} {year}
          </div>
          <button className="calendar-nav" onClick={nextMonth} aria-label="Следующий месяц">
            ›
          </button>
        </div>

        <div className="calendar-weekdays">
          {["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"].map((day) => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>

        <div className="calendar-days">{days}</div>

        <div className="calendar-legend">
          <div className="legend-item">
            <div className="legend-color free"></div>
            <span>Свободно</span>
          </div>
          <div className="legend-item">
            <div className="legend-color booked"></div>
            <span>Занято</span>
          </div>
          {selectedDate && !isDateBooked(selectedDate) && (
            <div className="legend-item">
              <div className="legend-color selected"></div>
              <span>Выбрано</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}