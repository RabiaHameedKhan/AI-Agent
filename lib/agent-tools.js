import db, { ensureDatabase } from "@/lib/db";

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

export async function executeGetServices() {
  await ensureDatabase();

  return db`
    SELECT id, name, description, duration_minutes, price, category
    FROM services
    ORDER BY id ASC
  `;
}

export async function executeCheckAvailability({ date, service_name }, phoneNumber) {
  void phoneNumber;
  await ensureDatabase();

  const slots = generateHourlySlots();
  const bookedRows = await db`
    SELECT appointment_time
    FROM bookings
    WHERE appointment_date = ${date}
      AND status = 'confirmed'
  `;

  const booked = new Set(bookedRows.map((row) => normalizeTime(row.appointment_time)));
  const availableSlots = slots.filter((slot) => !booked.has(slot));

  return {
    date,
    available_slots: availableSlots,
    service_name,
  };
}

export async function executeBookAppointment(
  { service_name, appointment_date, appointment_time, customer_name, notes },
  phoneNumber
) {
  await ensureDatabase();

  const [service] = await db`
    SELECT id
    FROM services
    WHERE name = ${service_name}
    LIMIT 1
  `;

  if (!service) {
    return { success: false, error: "Service not found" };
  }

  const normalizedTime = normalizeTime(appointment_time);
  const [existingBooking] = await db`
    SELECT id
    FROM bookings
    WHERE appointment_date = ${appointment_date}
      AND appointment_time = ${normalizedTime}
      AND status = 'confirmed'
    LIMIT 1
  `;

  if (existingBooking) {
    return { success: false, error: "Selected time slot is not available" };
  }

  const [result] = await db`
    INSERT INTO bookings (
      phone_number,
      customer_name,
      service_name,
      appointment_date,
      appointment_time,
      notes
    ) VALUES (
      ${phoneNumber},
      ${customer_name || ""},
      ${service_name},
      ${appointment_date},
      ${normalizedTime},
      ${notes || ""}
    )
    RETURNING id
  `;

  return {
    success: true,
    booking_id: result.id,
    message: "Booking confirmed",
  };
}

export async function executeGetMyBookings({ status }, phoneNumber) {
  await ensureDatabase();

  if (status && status !== "all") {
    return db`
      SELECT id, phone_number, customer_name, service_name, appointment_date, appointment_time, status, notes, created_at
      FROM bookings
      WHERE phone_number = ${phoneNumber}
        AND status = ${status}
      ORDER BY appointment_date ASC, appointment_time ASC
    `;
  }

  return db`
    SELECT id, phone_number, customer_name, service_name, appointment_date, appointment_time, status, notes, created_at
    FROM bookings
    WHERE phone_number = ${phoneNumber}
    ORDER BY appointment_date ASC, appointment_time ASC
  `;
}

export async function executeCancelBooking({ booking_id }, phoneNumber) {
  await ensureDatabase();

  const [booking] = await db`
    SELECT id, phone_number, status
    FROM bookings
    WHERE id = ${booking_id}
    LIMIT 1
  `;

  if (!booking || booking.phone_number !== phoneNumber) {
    return { success: false, error: "Not found or unauthorized" };
  }

  if (booking.status !== "cancelled") {
    await db`
      UPDATE bookings
      SET status = 'cancelled'
      WHERE id = ${booking_id}
    `;
  }

  return { success: true };
}

export async function executeSendMessageToSalon({ message }, phoneNumber, customerName) {
  await ensureDatabase();

  await db`
    INSERT INTO messages (phone_number, customer_name, content)
    VALUES (${phoneNumber}, ${customerName || ""}, ${message || ""})
  `;

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

export async function executeSaveCustomerName({ name }, phoneNumber) {
  await ensureDatabase();

  await db`
    INSERT INTO whatsapp_users (phone_number, name, last_seen)
    VALUES (${phoneNumber}, ${name || ""}, NOW())
    ON CONFLICT (phone_number) DO UPDATE SET
      name = EXCLUDED.name,
      last_seen = NOW()
  `;

  return { success: true };
}

export async function dispatchTool(toolName, toolInput = {}, phoneNumber, customerName) {
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
