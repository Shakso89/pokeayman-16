
import { supabase } from "@/integrations/supabase/client";

export interface AdminNotificationData {
  teacherName: string;
  studentName: string;
  type: 'coin_award' | 'pokemon_award';
  amount?: number;
  pokemonName?: string;
  reason?: string;
}

export const createAdminNotification = async (data: AdminNotificationData) => {
  try {
    // Get all owners to notify
    const { data: owners, error: ownersError } = await supabase
      .from('teachers')
      .select('id, display_name, username')
      .or('username.eq.Ayman,username.eq.Admin,email.eq.ayman.soliman.tr@gmail.com,email.eq.ayman.soliman.cc@gmail.com,email.eq.ayman@pokeayman.com');

    if (ownersError) {
      console.error('Error fetching owners:', ownersError);
      return;
    }

    if (!owners || owners.length === 0) {
      console.log('No owners found to notify');
      return;
    }

    // Create notification for each owner
    const notifications = owners.map(owner => {
      let title = '';
      let message = '';

      if (data.type === 'coin_award') {
        title = 'Coins Awarded';
        message = `${data.teacherName} awarded ${data.amount} coins to ${data.studentName}${data.reason ? ` - ${data.reason}` : ''}`;
      } else if (data.type === 'pokemon_award') {
        title = 'Pokemon Awarded';
        message = `${data.teacherName} awarded "${data.pokemonName}" to ${data.studentName}${data.reason ? ` - ${data.reason}` : ''}`;
      }

      return {
        recipient_id: owner.id,
        title,
        message,
        type: data.type,
        metadata: {
          teacherName: data.teacherName,
          studentName: data.studentName,
          amount: data.amount,
          pokemonName: data.pokemonName,
          reason: data.reason
        }
      };
    });

    const { error } = await supabase
      .from('admin_notifications')
      .insert(notifications);

    if (error) {
      console.error('Error creating admin notifications:', error);
    } else {
      console.log(`✅ Admin notifications sent to ${owners.length} owners`);
    }
  } catch (error) {
    console.error('Error in createAdminNotification:', error);
  }
};
