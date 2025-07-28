<main>
    <div class="download-layout">
        <button class="btn btn-secondary" on:click={() => (window.location.href = '/admin/download')}>
            Download Certificates
        </button>
    </div>
</main>

<style>
	.download-layout {
		max-width: 500px;
		margin: 0 auto;
		padding: 1rem;
		border: 1px solid #ccc;
		border-radius: 5px;
	}

	button {
		width: 100%;
		padding: 10px;
		background-color: #4caf50;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}

	button:hover {
		background-color: #45a049;
	}
</style>