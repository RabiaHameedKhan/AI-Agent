import db from "@/lib/db";

function normalizeTime(value) {
  if (!value || typeof value !== "string") return "";
  if (/^\d{2}:\d{2}$/.test(value)) return value;
  if (/^\d{1}:\d{2}$/.test(value)) return `0${value}`;
  return value;
}

function generateHourlySlots() {
  const slots = [];
  for (let hour = 9; hour <= 18; hour += 1) {
    slots.push(`${String(hour).padStart(2, "0")}:00`);
  }
  return slots;
}

export function executeGetServices() {
  const services = db
    .prepare(
      `
        SELECT id, name, description, duration_minutes, price, category
        FROM services
        ORDER BY id ASC
      `
    )
    .all();

  return services;
}

export function executeCheckAvailability({ date, service_name }, phoneNumber) {
  void phoneNumber;
  const slots = generateHourlySlots();
  const bookedRows = db
    .prepare(
      `
        SELECT appointment_time
        FROM bookings
        WHERE appointment_date = ?
          AND status = 'confirmed'
      `
    )
    .all(date);

  const booked = new Set(bookedRows.map((row) => normalizeTime(row.appointment_time)));
  const availableSlots = slots.filter((slot) => !booked.has(slot));

  return {
    date,
    available_slots: availableSlots,
    service_name,
  };
}

export function executeBookAppointment(
  { service_name, appointment_date, appointment_time, customer_name, notes },
  phoneNumber
) {
  const service = db
    .prepare("SELECT id FROM services WHERE name = ?")
    .get(service_name);

  if (!service) {
    return { success: false, error: "Service not found" };
  }

  const normalizedTime = normalizeTime(appointment_time);
  const existingBooking = db
    .prepare(
      `
        SELECT id
        FROM bookings
        WHERE appointment_date = ?
          AND appointment_time = ?
          AND status = 'confirmed'
        LIMIT 1
      `
    )
    .get(appointment_date, normalizedTime);

  if (existingBooking) {
    return { success: false, error: "Selected time slot is not available" };
  }

  const result = db
    .prepare(
      `
        INSERT INTO bookings (
          phone_number,
          customer_name,
          service_name,
          appointment_date,
          appointment_time,
          notes
        ) VALUES (?, ?, ?, ?, ?, ?)
      `
    )
    .run(
      phoneNumber,
      customer_name || "",
      service_name,
      appointment_date,
      normalizedTime,
      notes || ""
    );

  return {
    success: true,
    booking_id: result.lastInsertRowid,
    message: "Booking confirmed",
  };
}

export function executeGetMyBookings({ status }, phoneNumber) {
  if (status && status !== "all") {
    return db
      .prepare(
        `
          SELECT id, phone_number, customer_name, service_name, appointment_date, appointment_time, status, notes, created_at
          FROM bookings
          WHERE phone_number = ?
            AND status = ?
          ORDER BY appointment_date ASC, appointment_time ASC
        `
      )
      .all(phoneNumber, status);
  }

  return db
    .prepare(
      `
        SELECT id, phone_number, customer_name, service_name, appointment_date, appointment_time, status, notes, created_at
        FROM bookings
        WHERE phone_number = ?
        ORDER BY appointment_date ASC, appointment_time ASC
      `
    )
    .all(phoneNumber);
}

export function executeCancelBooking({ booking_id }, phoneNumber) {
  const booking = db
    .prepare("SELECT id, phone_number, status FROM bookings WHERE id = ?")
    .get(booking_id);

  if (!booking || booking.phone_number !== phoneNumber) {
    return { success: false, error: "Not found or unauthorized" };
  }

  if (booking.status !== "cancelled") {
    db.prepare("UPDATE bookings SET status = 'cancelled' WHERE id = ?").run(booking_id);
  }

  return { success: true };
}

export function executeSendMessageToSalon({ message }, phoneNumber, customerName) {
  db.prepare(
    `
      INSERT INTO messages (phone_number, customer_name, content)
      VALUES (?, ?, ?)
    `
  ).run(phoneNumber, customerName || "", message || "");

  return { success: true, message: "Message sent to salon team" };
}

export function executeGetSalonInfo() {
  return {
    name: "Lumière Salon",
    hours: "Mon-Sat 9am-7pm",
    address: "123 Beauty Lane",
    phone: "+1234567890",
    instagram: "@lumieresalon",
    cancellation_policy: "24 hours notice required",
  };
}

export function executeSaveCustomerName({ name }, phoneNumber) {
  db.prepare(
    `
      UPDATE whatsapp_users
      SET name = ?
      WHERE phone_number = ?
    `
  ).run(name || "", phoneNumber);

  return { success: true };
}

export function dispatchTool(toolName, toolInput = {}, phoneNumber, customerName) {
  switch (toolName) {
    case "get_services":
      return executeGetServices();
    case "check_availability":
      return executeCheckAvailability(toolInput, phoneNumber);
    case "book_appointment":
      return executeBookAppointment(toolInput, phoneNumber);
    case "get_my_bookings":
      return executeGetMyBookings(toolInput, phoneNumber);
    case "cancel_booking":
      return executeCancelBooking(toolInput, phoneNumber);
    case "send_message_to_salon":
      return executeSendMessageToSalon(toolInput, phoneNumber, customerName);
    case "get_salon_info":
      return executeGetSalonInfo();
    case "save_customer_name":
      return executeSaveCustomerName(toolInput, phoneNumber);
    default:
      return { success: false, error: `Unknown tool: ${toolName}` };
  }
}
