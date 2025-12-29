<!--
  Example Svelte component: Chat interface with prompt protection
  Place this in: src/routes/chat/+page.svelte
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { analyzePrompt } from '@guardial/sveltekit-sdk/client';
  import { initGuardial } from '$lib/guardial/client';

  let message = '';
  let response = '';
  let loading = false;
  let error = '';

  onMount(() => {
    initGuardial();
  });

  async function sendMessage() {
    if (!message.trim()) return;

    loading = true;
    error = '';

    try {
      // Analyze prompt before sending
      const analysis = await analyzePrompt(message);

      if (!analysis.allowed) {
        error = `Prompt blocked: ${analysis.reasons.join(', ')}`;
        return;
      }

      // Make API call
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Request failed');
      }

      const data = await res.json();
      response = data.response;
      message = ''; // Clear input

    } catch (err) {
      error = err instanceof Error ? err.message : 'An error occurred';
      console.error('Chat error:', err);
    } finally {
      loading = false;
    }
  }
</script>

<div class="chat-container">
  <h1>Chat</h1>
  
  {#if error}
    <div class="error">{error}</div>
  {/if}

  <div class="input-group">
    <input
      type="text"
      bind:value={message}
      placeholder="Enter your message..."
      disabled={loading}
      onkeydown={(e) => e.key === 'Enter' && !loading && sendMessage()}
    />
    <button on:click={sendMessage} disabled={loading || !message.trim()}>
      {loading ? 'Sending...' : 'Send'}
    </button>
  </div>

  {#if response}
    <div class="response">
      <h2>Response:</h2>
      <p>{response}</p>
    </div>
  {/if}
</div>

<style>
  .chat-container {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  .error {
    background: #fee;
    color: #c33;
    padding: 1rem;
    border-radius: 4px;
    margin-bottom: 1rem;
  }
  
  .input-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }
  
  input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  button {
    padding: 0.5rem 1rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
  
  .response {
    margin-top: 2rem;
    padding: 1rem;
    background: #f5f5f5;
    border-radius: 4px;
  }
</style>



