import { redirect } from 'next/navigation';

/**
 * Root redirect — sends users straight to the chat interface.
 */
export default function Home() {
  redirect('/chat');
}
