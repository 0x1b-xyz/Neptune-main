<template>
  <div>
    <input v-model="searchQuery" placeholder="Search users" @input="debouncedSearchUsers" />
    <ul v-if="searchResults.length > 0" class="search-results">
      <li v-for="user in searchResults" :key="user.id" @click="openChat(user)">
        {{ user.name }}
      </li>
    </ul>
    <p v-else>No users found.</p>
  </div>
</template>

<script>
import { ref, inject } from 'vue';
import { debounce } from 'lodash';
import "firebase/compat/firestore";

export default {
  setup() {
    // Adjust the path based on your project structure
    const firestore = inject('$firestore', null);

    const searchQuery = ref('');
    const searchResults = ref([]);

    const debouncedSearchUsers = debounce(() => {
      searchUsers();
    }, 300);

    const searchUsers = () => {
      if (!firestore) {
        console.error('Firestore is not initialized.');
        return;
      }
      const query = searchQuery.value.toLowerCase();

      firestore.collection('users')
        .where('name', '>=', query)
        .where('name', '<=', query + '\uf8ff')
        .get()
        .then((querySnapshot) => {
          searchResults.value = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
            // Add other user properties as needed
          }));
        })
        .catch((error) => {
          console.error('Error searching users:', error);
        });
    };

    const openChat = (user) => {
      // Handle opening the chat with the selected user
      // You may want to emit an event or navigate to a chat component
      console.log('Opening chat with:', user);
    };

    return {
      searchQuery,
      searchResults,
      debouncedSearchUsers,
      searchUsers,
      openChat,
    };
  },
};
</script>

<style scoped>
.search-bar {
  position: relative;
  padding: 10px;
  background-color: #333;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  background-color: white;
  z-index: 1;
}

.search-results ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.search-results li {
  padding: 10px;
  cursor: pointer;
}

.search-results li:hover {
  background-color: #f0f0f0;
}
</style>
