
import { supabase } from "@/integrations/supabase/client";

export const createNotification = async (
  recipientId: string,
  title: string,
  message: string,
  type: string = 'info',
  link?: string
) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        recipient_id: recipientId,
        title,
        message,
        type,
        link
      });

    if (error) throw error;
    console.log('Notification created successfully');
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

export const createCoinAwardNotification = async (
  studentId: string,
  amount: number,
  reason: string = 'reward'
) => {
  await createNotification(
    studentId,
    'Coins Awarded! 🪙',
    `You received ${amount} coins! ${reason}`,
    'coin_award'
  );
};

export const createCoinRemovalNotification = async (
  studentId: string,
  amount: number,
  reason: string = 'deduction'
) => {
  await createNotification(
    studentId,
    'Coins Deducted 💰',
    `${amount} coins were removed from your account. ${reason}`,
    'coin_removal'
  );
};

export const createPokemonAwardNotification = async (
  studentId: string,
  pokemonName: string,
  reason: string = 'reward'
) => {
  await createNotification(
    studentId,
    'New Pokémon! 🎉',
    `You received a new Pokémon: ${pokemonName}! ${reason}`,
    'pokemon_award'
  );
};

export const createPokemonRemovalNotification = async (
  studentId: string,
  pokemonName: string,
  reason: string = 'removed'
) => {
  await createNotification(
    studentId,
    'Pokémon Removed 😢',
    `${pokemonName} was removed from your collection. ${reason}`,
    'pokemon_removal'
  );
};

export const createHomeworkNotification = async (
  studentId: string,
  homeworkTitle: string,
  status: 'approved' | 'rejected' | 'new',
  feedback?: string
) => {
  let title = '';
  let message = '';
  let type = 'homework_update';

  switch (status) {
    case 'approved':
      title = 'Homework Approved! ✅';
      message = `Your homework "${homeworkTitle}" has been approved!${feedback ? ` Feedback: ${feedback}` : ''}`;
      break;
    case 'rejected':
      title = 'Homework Needs Revision 📝';
      message = `Your homework "${homeworkTitle}" needs improvements.${feedback ? ` Feedback: ${feedback}` : ''}`;
      break;
    case 'new':
      title = 'New Homework Assignment 📚';
      message = `New homework "${homeworkTitle}" has been assigned to your class.`;
      break;
  }

  await createNotification(studentId, title, message, type);
};
