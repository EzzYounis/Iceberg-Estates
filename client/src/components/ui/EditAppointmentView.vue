<template>
  <div class="max-w-xl mx-auto p-6 bg-white rounded shadow">
    <h1 class="text-2xl font-bold mb-4">Edit Appointment</h1>
    <form @submit.prevent="submitEdit">
      <div class="mb-4">
        <label class="block mb-1 font-semibold">Status</label>
        <select v-model="form.status" class="input">
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No Show</option>
        </select>
      </div>
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
        <label class="block mb-1 font-semibold">Agent</label>
        <div style="position:relative;">
          <input
            v-model="agentSearch"
            type="text"
            placeholder="Type to search and select agent..."
            class="input"
            :disabled="agentLoading"
            @focus="showAgentList = true"
            @input="showAgentList = true"
            @blur="() => setTimeout(() => showAgentList = false, 150)"
          />
          <ul v-if="showAgentList && filteredAgents.length > 0" class="absolute z-10 bg-white border w-full mt-1 rounded shadow max-h-48 overflow-auto">
            <li
              v-for="agent in filteredAgents"
              :key="agent.id"
              @mousedown.prevent="selectAgent(agent)"
              :class="['px-3 py-2 cursor-pointer hover:bg-primary-50', String(agent.id) === String(form.agentId) ? 'bg-primary-100 font-semibold' : '']"
            >
              {{ agent.firstName }} {{ agent.lastName }}
            </li>
          </ul>
        </div>
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

import apiClient, { API_ENDPOINTS } from '@/config/api';
import { computed, watch } from 'vue';
const agents = ref([]);
const agentSearch = ref('');
const agentLoading = ref(false);
const showAgentList = ref(false);
const appointmentLoaded = ref(false);
const form = ref({
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  propertyAddress: '',
  propertyPostcode: '',
  appointmentDate: '',
  appointmentTime: '',
  notes: '',
  status: 'scheduled',
  agentId: ''
});
function selectAgent(agent) {
  form.value.agentId = agent.id;
  agentSearch.value = agent.firstName + ' ' + agent.lastName;
  showAgentList.value = false;
}

const filteredAgents = computed(() => {
  if (!agentSearch.value) return agents.value;
  return agents.value.filter(a =>
    (a.firstName + ' ' + a.lastName).toLowerCase().includes(agentSearch.value.toLowerCase())
  );
});

watch(agentSearch, (val) => {
  if (!val) form.value.agentId = '';
});
const error = ref('');

onMounted(async () => {
  try {
    // Fetch agents first
    agentLoading.value = true;
    const agentRes = await apiClient.get(API_ENDPOINTS.AGENTS.BASE);
    agents.value = agentRes.data?.data?.agents || agentRes.data?.agents || [];
    agentLoading.value = false;

    // Fetch appointment
    const { data } = await api.get(`/api/appointments/${id}`);
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
    form.value.status = apt.status || 'scheduled';
    // Fix: The API returns userId as the agent ID, not agentId
    form.value.agentId = apt.userId ? String(apt.userId) : '';
    appointmentLoaded.value = true;
    
    // Set agentSearch based on the assigned agent
    if (form.value.agentId && agents.value.length > 0) {
      const found = agents.value.find(a => String(a.id) === String(form.value.agentId));
      if (found) {
        agentSearch.value = found.firstName + ' ' + found.lastName;
      } else {
        agentSearch.value = '';
      }
      console.log('Set agentSearch after appointment fetch:', agentSearch.value, 'agentId:', form.value.agentId, 'found agent:', found);
    } else if (apt.agent) {
      // If we have the agent info directly from the appointment
      form.value.agentId = String(apt.agent.id);
      agentSearch.value = apt.agent.firstName + ' ' + apt.agent.lastName;
      console.log('Set agentSearch from apt.agent:', agentSearch.value, 'agentId:', form.value.agentId);
    }
  } catch (err) {
    error.value = 'Failed to load appointment.';
  }
});

// Always update agentSearch when agentId or agents change
watch([
  () => agents.value.length,
  () => form.value.agentId
], ([agentsLen, agentId]) => {
  if (agentId && agentsLen > 0) {
    const found = agents.value.find(a => String(a.id) === String(agentId));
    agentSearch.value = found ? (found.firstName + ' ' + found.lastName) : '';
    console.log('Watcher updated agentSearch:', agentSearch.value, 'for agentId:', agentId);
  } else {
    agentSearch.value = '';
  }
}, { immediate: true });

async function submitEdit() {
  error.value = '';
  try {
    // Clone form, trim all fields, and set customerEmail to null if empty or whitespace
    const payload = { ...form.value };
    Object.keys(payload).forEach(key => {
      if (typeof payload[key] === 'string') payload[key] = payload[key].trim();
    });
    if (!payload.customerEmail) delete payload.customerEmail;
    
  // Always send agentId (can be null or string)
  // The backend expects agentId for assignment logic
  if (payload.agentId === '') payload.agentId = null;
    
    console.log('Submitting appointment update:', payload);
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
