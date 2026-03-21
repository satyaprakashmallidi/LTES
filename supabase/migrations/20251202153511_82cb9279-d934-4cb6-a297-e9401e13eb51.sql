-- Create inventory_parts table for tracking parts/stock
CREATE TABLE public.inventory_parts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  part_name TEXT NOT NULL,
  part_number TEXT,
  category TEXT NOT NULL DEFAULT 'General',
  manufacturer TEXT,
  unit_price DECIMAL(10,2),
  warehouse_stock INTEGER NOT NULL DEFAULT 0,
  terry_van_stock INTEGER NOT NULL DEFAULT 0,
  jason_van_stock INTEGER NOT NULL DEFAULT 0,
  min_stock_level INTEGER DEFAULT 5,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.inventory_parts ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Allow authenticated users full access to inventory_parts" 
ON public.inventory_parts 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_inventory_parts_updated_at
BEFORE UPDATE ON public.inventory_parts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();