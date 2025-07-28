<main>
	<form method="POST" use:enhance enctype="multipart/form-data">
		<div class="form-group">
			<label for="file">Upload your archived list of certificates</label>
			<input type="file" id="file" name="fileToUpload" accept=".json" required />
		</div>

		<button type="submit">Upload</button>
	</form>
</main>

<style>
	form {
		max-width: 500px;
		margin: 0 auto;
		padding: 1rem;
		border: 1px solid #ccc;
		border-radius: 5px;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
	}

	input[type='file'] {
		width: 100%;
		padding: 0.5rem;
		border-radius: 4px;
		border: 1px solid #ccc;
	}

	form button {
		width: 100%;
		padding: 10px;
		background-color: #4caf50;
		color: white;
		border: none;
		border-radius: 5px;
		cursor: pointer;
	}

	form button:hover {
		background-color: #45a049;
	}
</style>
