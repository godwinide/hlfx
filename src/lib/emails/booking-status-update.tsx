import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Heading,
  Hr,
} from '@react-email/components';

interface EmailProps {
  booking: any;
  celebrity: {
    name: string;
    profession: string;
  };
}

export const BookingStatusUpdateEmail = ({ booking, celebrity }: EmailProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatService = (service: string) => {
    return service.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Great news! Your booking has been approved.';
      case 'rejected':
        return 'We regret to inform you that your booking has been rejected.';
      case 'completed':
        return 'Your booking has been marked as completed.';
      default:
        return `Your booking status has been updated to ${status}.`;
    }
  };

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container>
          <Section style={{ padding: '40px 0', textAlign: 'center', backgroundColor: '#1a1a1a', color: '#ffffff' }}>
            <Heading as="h1">Booking Status Update</Heading>
          </Section>

          <Section style={{ padding: '40px 20px' }}>
            <Text>Dear {booking.customerName},</Text>
            <Text>
              {getStatusMessage(booking.status)}
            </Text>

            <Section style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', margin: '20px 0' }}>
              <Text><strong>Celebrity:</strong> {celebrity.name}</Text>
              <Text><strong>Service:</strong> {formatService(booking.service)}</Text>
              <Text><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</Text>
              <Text><strong>Amount:</strong> {formatCurrency(booking.amount)}</Text>
              <Text><strong>Status:</strong> {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</Text>
            </Section>

            {booking.status === 'approved' && (
              <Text>
                We'll be in touch with further details about your booking soon.
              </Text>
            )}

            <Hr style={{ margin: '32px 0', borderColor: '#e5e5e5' }} />

            <Text style={{ fontSize: '14px', color: '#666666' }}>
              If you have any questions, please don't hesitate to contact us.
            </Text>
          </Section>

          <Section style={{ padding: '32px 0', textAlign: 'center', backgroundColor: '#1a1a1a', color: '#ffffff' }}>
            <Text style={{ fontSize: '14px', margin: 0 }}>
              © {new Date().getFullYear()} TalentBooked. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};
