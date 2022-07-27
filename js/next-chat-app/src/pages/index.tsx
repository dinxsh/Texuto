import { useEffect, useState } from "react";
import { ConnectionState, useChannelMessage, useConnectionState, useLeap } from "@onehop/react";
import { HOP_CHANNEL_NAME } from "../config";
import { Message } from "../types";

export default function Index() {
	const [messages, setMessages] = useState<Array<{ content: string; id: string }>>([]);
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);

	useChannelMessage<Message>(HOP_CHANNEL_NAME, "MESSAGE_SEND", message => {
		setMessages(messages => [...messages, message]);
	});

	// TODO: useChannelMessage shoudl create a subscription to the channel
	// and right now it does not. The code below is a workaround but the logic
	// will eventually be moved to the useChannelMessage hook.
	const leap = useLeap();
	const connectionState = useConnectionState();

	useEffect(() => {
		if (typeof window === "undefined" || connectionState !== ConnectionState.CONNECTED) {
			return;
		}

		leap.subscribeToChannel(HOP_CHANNEL_NAME);

		return () => {
			leap.unsubscribeFromChannel(HOP_CHANNEL_NAME);
		};
	}, [connectionState]);

	return (
		<div>
			<h1>Next Chat App</h1>

			<ul>
				{messages.map(message => (
					<li key={message.id}>{message.content}</li>
				))}
			</ul>

			<form
				onSubmit={async e => {
					e.preventDefault();

					setLoading(true);

					try {
						await fetch("/api/message", {
							method: "POST",
							headers: { "Content-Type": "application/json" },
							body: JSON.stringify({ content: message }),
						});
					} finally {
						setLoading(false);
					}
				}}>
				<input type="text" value={message} onChange={e => setMessage(e.target.value)} />
				<button type="submit">Send</button>
			</form>
		</div>
	);
}