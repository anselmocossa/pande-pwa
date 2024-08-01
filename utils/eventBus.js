// utils/eventBus.js
import { ref } from 'vue';

const eventBus = ref(null);

export const EventBus = {
    $on(event, callback) {
        if (!eventBus.value) eventBus.value = {};
        if (!eventBus.value[event]) eventBus.value[event] = [];
        eventBus.value[event].push(callback);
    },
    $off(event, callback) {
        if (!eventBus.value || !eventBus.value[event]) return;
        eventBus.value[event] = eventBus.value[event].filter(cb => cb !== callback);
    },
    $emit(event, data) {
        if (!eventBus.value || !eventBus.value[event]) return;
        eventBus.value[event].forEach(callback => callback(data));
    }
};
