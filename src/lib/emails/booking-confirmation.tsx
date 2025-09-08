import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Heading,
  Hr,
  Link,
} from '@react-email/components';

interface EmailProps {
  booking: any;
  celebrity: {
    name: string;
    profession: string;
  };
}

export const BookingConfirmationEmail = ({ booking, celebrity }: EmailProps) => {
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

  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }}>
        <Container>
          <Section style={{ padding: '40px 0', textAlign: 'center', backgroundColor: '#1a1a1a', color: '#ffffff' }}>
            <Heading as="h1">Booking Confirmation</Heading>
          </Section>

          <Section style={{ padding: '40px 20px' }}>
            <Text>Dear {booking.customerName},</Text>
            <Text>
              Thank you for your booking with {celebrity.name}. Here are your booking details:
            </Text>

            <Section style={{ padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px', margin: '20px 0' }}>
              <Text><strong>Service:</strong> {formatService(booking.service)}</Text>
              <Text><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</Text>
              <Text><strong>Amount:</strong> {formatCurrency(booking.amount)}</Text>
              <Text><strong>Status:</strong> {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}</Text>
              
              {booking.service === 'subscription' && booking.metadata && (
                <>
                  <Hr style={{ margin: '16px 0', borderColor: '#e5e5e5' }} />
                  <Text><strong>Subscription Plan:</strong> {booking.metadata.subscriptionPlan ? booking.metadata.subscriptionPlan.charAt(0).toUpperCase() + booking.metadata.subscriptionPlan.slice(1) : 'Monthly'}</Text>
                  <Text><strong>Duration:</strong> {booking.metadata.subscriptionDuration || '1 month'}</Text>
                  <Text><strong>Next Renewal:</strong> {booking.metadata.renewalDate ? new Date(booking.metadata.renewalDate).toLocaleDateString() : new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}</Text>
                </>
              )}
            </Section>

            <Text>
              {booking.service === 'subscription' 
                ? `Your subscription is now active. You'll receive exclusive content from ${celebrity.name} according to your subscription plan.` 
                : 'Your booking is currently pending approval. We\'ll notify you once it\'s been reviewed.'}
            </Text>

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
