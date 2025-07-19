import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Calendar, DollarSign, AlertTriangle, CheckCircle, Clock, XCircle, ArrowLeft, Plus, CreditCard } from 'lucide-react';
import { format, addMonths, isPast, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SubscriptionManagerProps {
  onBack: () => void;
  onLogout: () => void;
  userData: any;
}

interface Company {
  id: string;
  name: string;
  created_at: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  max_users: number;
  max_branches: number;
  features: any;
  is_active: boolean;
}

interface CompanySubscription {
  id: string;
  company_id: string;
  plan_id: string;
  status: string;
  started_at: string;
  expires_at: string;
  last_payment_date: string | null;
  next_payment_due: string;
  payment_amount: number | null;
  grace_period_days: number;
  auto_suspend: boolean;
  notes: string | null;
  custom_max_users?: number | null;
  custom_max_branches?: number | null;
  custom_price?: number | null;
  plan: any;
  company: any;
}

interface PaymentHistory {
  id: string;
  company_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number: string | null;
  notes: string | null;
  company: any;
}

const SubscriptionManager = ({ onBack, onLogout, userData }: SubscriptionManagerProps) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [subscriptions, setSubscriptions] = useState<CompanySubscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState<string>('');
  const [showNewSubscription, setShowNewSubscription] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [paymentData, setPaymentData] = useState({
    company_id: '',
    amount: '',
    payment_method: 'manual',
    reference_number: '',
    notes: ''
  });
  const [customPlanData, setCustomPlanData] = useState({
    max_users: '',
    max_branches: '',
    price: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar empresas
      const { data: companiesData } = await supabase
        .from('companies')
        .select('*')
        .order('name');
      
      // Carregar planos
      const { data: plansData } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly');
      
      // Carregar assinaturas com planos e empresas
      const { data: subscriptionsData } = await supabase
        .from('company_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*),
          company:companies(*)
        `)
        .order('expires_at');
      
      // Carregar histórico de pagamentos
      const { data: historyData } = await supabase
        .from('payment_history')
        .select(`
          *,
          company:companies(*)
        `)
        .order('payment_date', { ascending: false })
        .limit(50);

      setCompanies(companiesData || []);
      setPlans(plansData || []);
      setSubscriptions(subscriptionsData || []);
      setPaymentHistory(historyData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const createSubscription = async (companyId: string, planId: string, months: number = 1, isCustom: boolean = false) => {
    try {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      const now = new Date();
      const expiresAt = addMonths(now, months);
      
      const subscriptionData: any = {
        company_id: companyId,
        plan_id: planId,
        expires_at: expiresAt.toISOString(),
        next_payment_due: expiresAt.toISOString(),
        payment_amount: plan.price_monthly,
        status: 'active'
      };

      // Adicionar valores customizados se for plano personalizado
      if (isCustom && plan.name === 'Plano Personalizado') {
        subscriptionData.custom_max_users = customPlanData.max_users ? parseInt(customPlanData.max_users) : null;
        subscriptionData.custom_max_branches = customPlanData.max_branches ? parseInt(customPlanData.max_branches) : null;
        subscriptionData.custom_price = customPlanData.price ? parseFloat(customPlanData.price) : null;
        subscriptionData.payment_amount = parseFloat(customPlanData.price) || 0;
      }

      const { error } = await supabase
        .from('company_subscriptions')
        .insert(subscriptionData);

      if (error) throw error;
      
      toast.success('Assinatura criada com sucesso!');
      loadData();
      setShowNewSubscription(false);
      setSelectedCompany('');
      setCustomPlanData({ max_users: '', max_branches: '', price: '' });
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
      toast.error('Erro ao criar assinatura');
    }
  };

  const processPayment = async () => {
    try {
      if (!paymentData.company_id || !paymentData.amount) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      // Encontrar assinatura da empresa
      const subscription = subscriptions.find(s => s.company_id === paymentData.company_id);
      if (!subscription) {
        toast.error('Empresa não possui assinatura ativa');
        return;
      }

      // Registrar pagamento
      const { error: paymentError } = await supabase
        .from('payment_history')
        .insert({
          company_id: paymentData.company_id,
          subscription_id: subscription.id,
          amount: parseFloat(paymentData.amount),
          payment_method: paymentData.payment_method,
          reference_number: paymentData.reference_number || null,
          notes: paymentData.notes || null,
          created_by: userData.id
        });

      if (paymentError) throw paymentError;

      // Atualizar assinatura
      const newExpiresAt = addMonths(new Date(subscription.expires_at), 1);
      const { error: subscriptionError } = await supabase
        .from('company_subscriptions')
        .update({
          last_payment_date: new Date().toISOString(),
          expires_at: newExpiresAt.toISOString(),
          next_payment_due: newExpiresAt.toISOString(),
          status: 'active'
        })
        .eq('id', subscription.id);

      if (subscriptionError) throw subscriptionError;

      toast.success('Pagamento processado com sucesso!');
      setShowPaymentDialog(false);
      setPaymentData({
        company_id: '',
        amount: '',
        payment_method: 'manual',
        reference_number: '',
        notes: ''
      });
      loadData();
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast.error('Erro ao processar pagamento');
    }
  };

  const suspendSubscription = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('company_subscriptions')
        .update({ status: 'suspended' })
        .eq('id', subscriptionId);

      if (error) throw error;
      
      toast.success('Assinatura suspensa');
      loadData();
    } catch (error) {
      console.error('Erro ao suspender assinatura:', error);
      toast.error('Erro ao suspender assinatura');
    }
  };

  const reactivateSubscription = async (subscriptionId: string) => {
    try {
      const { error } = await supabase
        .from('company_subscriptions')
        .update({ status: 'active' })
        .eq('id', subscriptionId);

      if (error) throw error;
      
      toast.success('Assinatura reativada');
      loadData();
    } catch (error) {
      console.error('Erro ao reativar assinatura:', error);
      toast.error('Erro ao reativar assinatura');
    }
  };

  const getStatusBadge = (subscription: CompanySubscription) => {
    const isExpired = isPast(new Date(subscription.expires_at));
    const isInGracePeriod = isExpired && isAfter(
      new Date(),
      new Date(new Date(subscription.expires_at).getTime() + subscription.grace_period_days * 24 * 60 * 60 * 1000)
    );

    if (subscription.status === 'suspended') {
      return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Suspensa</Badge>;
    }
    
    if (subscription.status === 'cancelled') {
      return <Badge variant="secondary"><XCircle className="w-3 h-3 mr-1" />Cancelada</Badge>;
    }
    
    if (isInGracePeriod) {
      return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Vencida</Badge>;
    }
    
    if (isExpired) {
      return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Período de Graça</Badge>;
    }
    
    if (subscription.status === 'trial') {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Trial</Badge>;
    }
    
    return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Ativa</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Gerenciamento de Assinaturas</h1>
            <p className="text-muted-foreground">Controle pagamentos e acesso das empresas</p>
          </div>
        </div>
        <Button onClick={onLogout} variant="outline">
          Sair
        </Button>
      </div>

      <Tabs defaultValue="subscriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscriptions">Assinaturas</TabsTrigger>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="plans">Planos</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Assinaturas Ativas</h2>
            <div className="space-x-2">
              <Dialog open={showNewSubscription} onOpenChange={setShowNewSubscription}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Assinatura
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Assinatura</DialogTitle>
                    <DialogDescription>
                      Selecione uma empresa e plano para criar a assinatura.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Empresa</Label>
                      <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies
                            .filter(c => !subscriptions.some(s => s.company_id === c.id))
                            .map(company => (
                              <SelectItem key={company.id} value={company.id}>
                                {company.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {plans.map(plan => (
                        <Card key={plan.id} className="cursor-pointer hover:bg-accent" 
                              onClick={() => {
                                if (selectedCompany) {
                                  if (plan.name === 'Plano Personalizado') {
                                    // Para plano personalizado, mostrar campos de configuração
                                    return;
                                  } else {
                                    createSubscription(selectedCompany, plan.id);
                                  }
                                }
                              }}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-center">
                              <div>
                                <h4 className="font-medium">{plan.name}</h4>
                                <p className="text-sm text-muted-foreground">{plan.description}</p>
                                {plan.name !== 'Plano Personalizado' && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {plan.max_users} usuários • {plan.max_branches} filial(is)
                                  </p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="font-bold">
                                  {plan.name === 'Plano Personalizado' ? 'Personalizado' : formatCurrency(plan.price_monthly)}
                                </p>
                                {plan.name !== 'Plano Personalizado' && (
                                  <p className="text-xs text-muted-foreground">por mês</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                    
                    {/* Configuração do Plano Personalizado */}
                    {plans.find(p => p.name === 'Plano Personalizado') && (
                      <div className="border-t pt-4 space-y-4">
                        <h4 className="font-medium">Configuração Personalizada</h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Máx. Usuários</Label>
                            <Input
                              type="number"
                              placeholder="Ex: 100"
                              value={customPlanData.max_users}
                              onChange={(e) => setCustomPlanData(prev => ({ ...prev, max_users: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>Máx. Filiais</Label>
                            <Input
                              type="number"
                              placeholder="Ex: 10"
                              value={customPlanData.max_branches}
                              onChange={(e) => setCustomPlanData(prev => ({ ...prev, max_branches: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label>Valor Mensal (R$)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Ex: 750.00"
                              value={customPlanData.price}
                              onChange={(e) => setCustomPlanData(prev => ({ ...prev, price: e.target.value }))}
                            />
                          </div>
                        </div>
                        <Button 
                          onClick={() => {
                            if (selectedCompany && customPlanData.max_users && customPlanData.max_branches && customPlanData.price) {
                              const customPlan = plans.find(p => p.name === 'Plano Personalizado');
                              if (customPlan) {
                                createSubscription(selectedCompany, customPlan.id, 1, true);
                              }
                            } else {
                              toast.error('Preencha todos os campos do plano personalizado');
                            }
                          }}
                          className="w-full"
                          disabled={!selectedCompany || !customPlanData.max_users || !customPlanData.max_branches || !customPlanData.price}
                        >
                          Criar Assinatura Personalizada
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Registrar Pagamento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Pagamento</DialogTitle>
                    <DialogDescription>
                      Registre um pagamento para estender a assinatura da empresa.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Empresa</Label>
                      <Select value={paymentData.company_id} onValueChange={(value) => {
                        const subscription = subscriptions.find(s => s.company_id === value);
                        const amount = subscription ? (
                          subscription.custom_price || subscription.plan.price_monthly
                        ).toString() : '';
                        setPaymentData(prev => ({ ...prev, company_id: value, amount }));
                      }}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {subscriptions.map(subscription => (
                            <SelectItem key={subscription.company_id} value={subscription.company_id}>
                              {subscription.company.name} - {formatCurrency(subscription.custom_price || subscription.plan.price_monthly)}/mês
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Valor</Label>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={paymentData.amount}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                      />
                      {paymentData.company_id && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Valor padrão da assinatura preenchido automaticamente
                        </p>
                      )}
                    </div>
                    <div>
                      <Label>Método de Pagamento</Label>
                      <Select value={paymentData.payment_method} onValueChange={(value) => 
                        setPaymentData(prev => ({ ...prev, payment_method: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="bank_transfer">Transferência</SelectItem>
                          <SelectItem value="credit_card">Cartão</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Número de Referência</Label>
                      <Input
                        placeholder="Opcional"
                        value={paymentData.reference_number}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, reference_number: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Observações</Label>
                      <Textarea
                        placeholder="Observações sobre o pagamento"
                        value={paymentData.notes}
                        onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                    <Button onClick={processPayment} className="w-full">
                      Registrar Pagamento
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid gap-4">
            {subscriptions.map(subscription => (
              <Card key={subscription.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg">{subscription.company.name}</h3>
                        {getStatusBadge(subscription)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Plano: {subscription.plan.name} - {formatCurrency(subscription.plan.price_monthly)}/mês
                      </p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Expira: {format(new Date(subscription.expires_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </div>
                        {subscription.last_payment_date && (
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            Último pagamento: {format(new Date(subscription.last_payment_date), 'dd/MM/yyyy', { locale: ptBR })}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-x-2">
                      {subscription.status === 'active' ? (
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => suspendSubscription(subscription.id)}
                        >
                          Suspender
                        </Button>
                      ) : (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => reactivateSubscription(subscription.id)}
                        >
                          Reativar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
              <CardDescription>Últimos 50 pagamentos registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Referência</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paymentHistory.map(payment => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.company.name}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        {format(new Date(payment.payment_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </TableCell>
                      <TableCell className="capitalize">{payment.payment_method}</TableCell>
                      <TableCell>{payment.reference_number || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans">
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map(plan => (
              <Card key={plan.id}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{formatCurrency(plan.price_monthly)}</div>
                    <div className="text-sm text-muted-foreground">por mês</div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Máx. usuários:</span>
                      <span>{plan.max_users}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Máx. filiais:</span>
                      <span>{plan.max_branches}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Recursos:</h4>
                    <ul className="text-sm space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubscriptionManager;