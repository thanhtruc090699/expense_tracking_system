import { Title, Form, FormGroup, TextInput, Switch, Card, CardTitle, CardBody, Button } from '@patternfly/react-core';

export function SettingsPage() {
  return (
    <>
      <Title headingLevel="h1" size="xl">Settings</Title>
      <p>Configure your BillBuddy preferences</p>

      <Card>
        <CardTitle>OCR Settings</CardTitle>
        <CardBody>
          <Form>
            <FormGroup label="OCR Provider" fieldId="ocr-provider">
              <TextInput id="ocr-provider" name="ocr-provider" value="EasyOCR" />
            </FormGroup>
            <FormGroup label="Auto-scan bills" fieldId="auto-scan">
              <Switch id="auto-scan" isChecked={true} />
            </FormGroup>
          </Form>
        </CardBody>
      </Card>

      <Card style={{ marginTop: '16px' }}>
        <CardTitle>Notification Settings</CardTitle>
        <CardBody>
          <Form>
            <FormGroup label="Email notifications" fieldId="email-notif">
              <Switch id="email-notif" isChecked={true} />
            </FormGroup>
            <FormGroup label="Reminder days before due" fieldId="reminder-days">
              <TextInput id="reminder-days" name="reminder-days" type="number" value="3" />
            </FormGroup>
          </Form>
        </CardBody>
      </Card>

      <Button variant="primary" style={{ marginTop: '16px' }}>Save Settings</Button>
    </>
  );
}