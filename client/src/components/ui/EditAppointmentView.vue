<template>
  <div class="max-w-xl mx-auto p-6 bg-white rounded shadow">
    <h1 class="text-2xl font-bold mb-4">Edit Appointment</h1>
    <form @submit.prevent="submitEdit">
      <div class="mb-4">
        <label class="block mb-1 font-semibold">Customer Name</label>
        <input v-model="form.customerName" class="input" required />
      </div>
      <div class="mb-4">
        <label class="block mb-1 font-semibold">Customer Email</label>
        <input v-model="form.customerEmail" class="input" type="email" />
      </div>
      <div class="mb-4">
        <label class="block mb-1 font-semibold">Customer Phone</label>
        <input v-model="form.customerPhone" class="input" required />
      </div>
      <div class="mb-4">
        <label class="block mb-1 font-semibold">Property Address</label>
        <input v-model="form.propertyAddress" class="input" required />
      </div>
      <div class="mb-4">
        <label class="block mb-1 font-semibold">Property Postcode</label>
        <input v-model="form.propertyPostcode" class="input" required />
      </div>
      <div class="mb-4">
        <label class="block mb-1 font-semibold">Appointment Date</label>
        <input v-model="form.appointmentDate" class="input" type="date" required />
      </div>
      <div class="mb-4">
        <label class="block mb-1 font-semibold">Appointment Time</label>
        <input v-model="form.appointmentTime" class="input" type="time" required />
      </div>
      <div class="mb-4">
        <label class="block mb-1 font-semibold">Notes</label>
        <textarea v-model="form.notes" class="input" rows="3"></textarea>
      </div>
      <div class="flex gap-2">
        <button type="submit" class="btn btn-primary">Save Changes</button>
        <router-link :to="{ name: 'Appointments' }" class="btn btn-secondary">Cancel</router-link>
      </div>
    </form>
    <div v-if="error" class="text-red-600 mt-4">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/config/api';

const route = useRoute();
const router = useRouter();
const id = route.params.id;

const form = ref({
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  propertyAddress: '',
  propertyPostcode: '',
  appointmentDate: '',
  appointmentTime: '',
  notes: ''
});
const error = ref('');

onMounted(async () => {
  try {
          const { data } = await api.get(`/api/appointments/${id}`);
          console.log('Full API response:', data);
          if (!data.data || !data.data.appointment) {
            error.value = 'Appointment data missing from API response.';
            return;
          }
          const apt = data.data.appointment;
          form.value.customerName = apt.customerName || '';
          form.value.customerEmail = apt.customerEmail || '';
          if (form.value.customerEmail === null) form.value.customerEmail = '';
          form.value.customerPhone = apt.customerPhone || '';
          form.value.propertyAddress = apt.propertyAddress || '';
          form.value.propertyPostcode = apt.propertyPostcode || '';
          form.value.appointmentDate = apt.appointmentDate ? apt.appointmentDate.slice(0, 10) : '';
          form.value.appointmentTime = apt.appointmentTime ? apt.appointmentTime.slice(0, 5) : '';
          form.value.notes = apt.notes || '';
  } catch (err) {
    error.value = 'Failed to load appointment.';
  }
});

async function submitEdit() {
  error.value = '';
  try {
    // Clone form, trim all fields, and set customerEmail to null if empty or whitespace
    const payload = { ...form.value };
    Object.keys(payload).forEach(key => {
      if (typeof payload[key] === 'string') payload[key] = payload[key].trim();
    });
  if (!payload.customerEmail) delete payload.customerEmail;
    await api.put(`/api/appointments/${id}`, payload);
    router.push({ name: 'Appointments' });
  } catch (err) {
    // Show detailed validation errors if available
    if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
      error.value = err.response.data.details.map(e => `${e.field}: ${e.message}`).join('\n');
    } else {
      error.value = err.response?.data?.message || 'Failed to update appointment.';
    }
  }
}
</script>

<style scoped>
.input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
}
.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
  cursor: pointer;
}
.btn-primary {
  background: #2563eb;
  color: white;
}
.btn-secondary {
  background: #e5e7eb;
  color: #111827;
}
</style>
