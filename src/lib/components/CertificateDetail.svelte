<script>
  export let selectedCertificate;
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  function close() {
    dispatch('close');
  }
</script>

<style>
  .modal {
    background-color: white;
    padding: 20px;
    border-radius: 10px;
    width: 80%;
    max-width: 500px;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #ddd;
    margin-bottom: 10px;
  }

  .close-button {
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    padding: 5px 10px;
  }

  .close-button:hover {
    background-color: #c0392b;
  }
</style>

<div class="modal">
  <div class="modal-header">
    <h2>Certificate Details</h2>
    <button class="close-button" on:click={close}>Close</button>
  </div>
  <div>
    <p><strong>ID:</strong> {selectedCertificate.id}</p>
    <p><strong>Common Name:</strong> {selectedCertificate.commonName}</p>
    <p><strong>Organization:</strong> {selectedCertificate.organization}</p>
    <p><strong>Country:</strong> {selectedCertificate.country}</p>
    <p><strong>Status:</strong> {selectedCertificate.status}</p>
  </div>
</div>