import { useState } from 'react';
import {
  Card,
  CardBody,
  Form,
  FormGroup,
  TextInput,
  Button,
  Checkbox,
  Title,
  Bullseye,
} from '@patternfly/react-core';
import logo from '../assets/billbuddy.svg';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login:', { email, password });
  };

  return (
    <Bullseye>
      <Card style={{ minWidth: '400px', maxWidth: '450px' }}>
        <CardBody>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <img src={logo} alt="BillBuddy" style={{ height: '48px' }} />
            <Title headingLevel="h2" size="xl" style={{ marginTop: '16px' }}>
              Sign in to BillBuddy
            </Title>
          </div>
          <Form onSubmit={handleSubmit}>
            <FormGroup label="Email" isRequired fieldId="email">
              <TextInput
                id="email"
                type="email"
                value={email}
                onChange={(_event, value) => setEmail(value)}
                placeholder="Enter your email"
                required
              />
            </FormGroup>
            <FormGroup label="Password" isRequired fieldId="password">
              <TextInput
                id="password"
                type="password"
                value={password}
                onChange={(_event, value) => setPassword(value)}
                placeholder="Enter your password"
                required
              />
            </FormGroup>
            <FormGroup fieldId="remember">
              <Checkbox
                id="remember"
                label="Remember me"
              />
            </FormGroup>
            <Button type="submit" variant="primary" isBlock style={{ marginTop: '16px' }}>
              Sign in
            </Button>
          </Form>
        </CardBody>
      </Card>
    </Bullseye>
  );
}