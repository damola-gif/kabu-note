
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useSendMessage } from '@/hooks/useRoomMessages';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const messageSchema = z.object({
  content: z.string().min(1, 'Message cannot be empty').max(1000),
});

type MessageFormValues = z.infer<typeof messageSchema>;

interface MessageInputProps {
  roomId: string;
}

export const MessageInput = ({ roomId }: MessageInputProps) => {
  const sendMessage = useSendMessage();
  const form = useForm<MessageFormValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: '' },
  });

  const onSubmit = async (values: MessageFormValues) => {
    await sendMessage.mutateAsync({ roomId, content: values.content }, {
      onSuccess: () => {
        form.reset();
      },
      onError: (error: any) => {
        toast({
          title: 'Error sending message',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2 p-4 border-t bg-background">
      <Input
        {...form.register('content')}
        placeholder="Type a message..."
        autoComplete="off"
        className="flex-grow"
        disabled={sendMessage.isPending}
      />
      <Button type="submit" size="icon" disabled={sendMessage.isPending}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};
