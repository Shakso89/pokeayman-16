import { supabase } from "@/integrations/supabase/client";

export const createNotification = async (
  recipientId: string,
  title: string,
  message: string,
  type: string = 'info',
  link?: string
) => {
  try {
    // Check for recent duplicate notifications (within last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { data: existingNotifications } = await supabase
      .from('notifications')
      .select('id')
      .eq('recipient_id', recipientId)
      .eq('title', title)
      .eq('message', message)
      .eq('type', type)
      .gte('created_at', fiveMinutesAgo)
      .limit(1);

    if (existingNotifications && existingNotifications.length > 0) {
      console.log('🔕 Duplicate notification prevented:', { title, message });
      return;
    }

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
    console.log('✅ Notification created successfully:', title);
  } catch (error) {
    console.error('❌ Error creating notification:', error);
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

export const createHomeworkSubmissionNotification = async (
  teacherId: string,
  studentName: string,
  homeworkTitle: string
) => {
  await createNotification(
    teacherId,
    'New Homework Submission 📝',
    `${studentName} submitted homework for "${homeworkTitle}"`,
    'homework_submission'
  );
};

export const createFriendRequestNotification = async (
  recipientId: string,
  senderName: string
) => {
  await createNotification(
    recipientId,
    'New Friend Request 👫',
    `${senderName} sent you a friend request`,
    'friend_request'
  );
};

export const createFriendAcceptedNotification = async (
  recipientId: string,
  accepterName: string
) => {
  await createNotification(
    recipientId,
    'Friend Request Accepted! 🎉',
    `${accepterName} accepted your friend request`,
    'friend_accepted'
  );
};

export const createStatusUpdateNotification = async (
  recipientId: string,
  posterName: string,
  statusPreview: string
) => {
  await createNotification(
    recipientId,
    'New Status Update 📱',
    `${posterName} posted: "${statusPreview.substring(0, 50)}${statusPreview.length > 50 ? '...' : ''}"`,
    'status_update'
  );
};

export const notifyStudentsOfNewHomework = async (
  classId: string,
  homeworkTitle: string
) => {
  try {
    // Get all students in the class
    const { data: students, error } = await supabase
      .from('student_classes')
      .select('student_id')
      .eq('class_id', classId);

    if (error) {
      console.error('Error getting students for notifications:', error);
      return;
    }

    // Send notification to each student
    for (const student of students || []) {
      await createHomeworkNotification(
        student.student_id,
        homeworkTitle,
        'new'
      );
    }

    console.log(`Sent new homework notifications to ${students?.length || 0} students`);
  } catch (error) {
    console.error('Error sending homework notifications:', error);
  }
};
