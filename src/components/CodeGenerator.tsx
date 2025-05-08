
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

type CodeType = "TRIAL" | "MONTH" | "YEAR";

const CodeGenerator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [codeType, setCodeType] = useState<CodeType>("TRIAL");
  const [quantity, setQuantity] = useState<number>(10);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [savedCodes, setSavedCodes] = useState<{
    TRIAL: string[];
    MONTH: string[];
    YEAR: string[];
  }>({
    TRIAL: [],
    MONTH: [],
    YEAR: []
  });

  // Load previously generated codes
  useEffect(() => {
    const loadSavedCodes = () => {
      const allCodes = JSON.parse(localStorage.getItem("activationCodes") || "[]");
      const trialCodes = allCodes.filter((code: string) => code.startsWith("TRIAL"));
      const monthCodes = allCodes.filter((code: string) => code.startsWith("MONTH"));
      const yearCodes = allCodes.filter((code: string) => code.startsWith("YEAR"));
      
      setSavedCodes({
        TRIAL: trialCodes,
        MONTH: monthCodes,
        YEAR: yearCodes
      });
    };
    
    loadSavedCodes();
  }, [isOpen]);

  const handleGenerate = () => {
    const newCodes: string[] = [];
    
    // Generate unique codes
    for (let i = 0; i < quantity; i++) {
      const randomStr = Math.random().toString(36).substring(2, 10).toUpperCase();
      const code = `${codeType}${randomStr}`;
      newCodes.push(code);
    }
    
    // Save codes to localStorage
    const allCodes = JSON.parse(localStorage.getItem("activationCodes") || "[]");
    localStorage.setItem("activationCodes", JSON.stringify([...allCodes, ...newCodes]));
    
    // Update state
    setGeneratedCodes(newCodes);
    setSavedCodes(prev => ({
      ...prev,
      [codeType]: [...prev[codeType], ...newCodes]
    }));
    
    toast({
      title: "Codes generated",
      description: `${quantity} ${codeType} codes have been generated.`,
    });
  };
  
  const copyToClipboard = (codes: string[]) => {
    const codesText = codes.join('\n');
    navigator.clipboard.writeText(codesText);
    toast({
      title: "Copied to clipboard",
      description: `${codes.length} codes copied to clipboard.`,
    });
  };
  
  const downloadAsTxt = (codes: string[], type: string) => {
    const codesText = codes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type.toLowerCase()}-codes-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        variant="outline" 
        className="ml-2"
      >
        Admin Tools
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Activation Code Generator</DialogTitle>
            <DialogDescription>
              Generate and manage activation codes for your users.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generate">Generate Codes</TabsTrigger>
              <TabsTrigger value="view">View Codes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="generate" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codeType">Code Type</Label>
                  <Select 
                    value={codeType} 
                    onValueChange={(value) => setCodeType(value as CodeType)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select code type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRIAL">Trial (7 days)</SelectItem>
                      <SelectItem value="MONTH">Monthly</SelectItem>
                      <SelectItem value="YEAR">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    min="1" 
                    max="500"
                    value={quantity} 
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
              
              <Button onClick={handleGenerate} className="w-full mt-6">
                Generate Codes
              </Button>
              
              {generatedCodes.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">Generated Codes</h4>
                    <div className="space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => copyToClipboard(generatedCodes)}
                      >
                        Copy All
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadAsTxt(generatedCodes, codeType)}
                      >
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  <ScrollArea className="h-[200px] w-full rounded-md border p-2">
                    <div className="space-y-1">
                      {generatedCodes.map((code, index) => (
                        <div key={index} className="flex justify-between items-center py-1 px-2 hover:bg-gray-100 rounded">
                          <span className="font-mono text-sm">{code}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="view" className="space-y-4 py-4">
              <Tabs defaultValue="TRIAL">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="TRIAL">Trial ({savedCodes.TRIAL.length})</TabsTrigger>
                  <TabsTrigger value="MONTH">Monthly ({savedCodes.MONTH.length})</TabsTrigger>
                  <TabsTrigger value="YEAR">Annual ({savedCodes.YEAR.length})</TabsTrigger>
                </TabsList>
                
                {(["TRIAL", "MONTH", "YEAR"] as const).map((type) => (
                  <TabsContent key={type} value={type} className="space-y-4 py-4">
                    {savedCodes[type].length > 0 ? (
                      <>
                        <div className="flex justify-between items-center">
                          <h4 className="text-sm font-medium">{type} Codes</h4>
                          <div className="space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => copyToClipboard(savedCodes[type])}
                            >
                              Copy All
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => downloadAsTxt(savedCodes[type], type)}
                            >
                              Download
                            </Button>
                          </div>
                        </div>
                        
                        <ScrollArea className="h-[200px] w-full rounded-md border p-2">
                          <div className="space-y-1">
                            {savedCodes[type].map((code, index) => (
                              <div key={index} className="flex justify-between items-center py-1 px-2 hover:bg-gray-100 rounded">
                                <span className="font-mono text-sm">{code}</span>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </>
                    ) : (
                      <div className="py-8 text-center text-gray-500">
                        No {type.toLowerCase()} codes generated yet.
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CodeGenerator;
