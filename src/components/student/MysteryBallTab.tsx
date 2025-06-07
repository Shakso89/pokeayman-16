// ... [imports remain unchanged]

const MysteryBallTab: React.FC<MysteryBallTabProps> = ({
  schoolPokemons,
  studentId,
  schoolId,
  coins,
  isLoading,
  onPokemonWon,
  onCoinsWon,
  onRefreshPool
}) => {
  // ... [state and helper functions remain unchanged]

  return (
    <Card className="mx-auto max-w-xl shadow-lg">
      <CardHeader className="text-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-t-md">
        <CardTitle className="text-2xl">Mystery Pokémon Ball</CardTitle>
        <CardDescription className="text-white opacity-90">2 coins per try, first attempt is free daily</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        {schoolPokemons.length === 0 ? (
          <div className="text-center p-8">
            <p className="mb-4 text-lg text-gray-700">No available Pokémon</p>
            <Button onClick={onRefreshPool} className="mx-auto flex items-center gap-2" disabled={isLoading}>
              <RefreshCw className="h-4 w-4" />
              {isLoading ? "Checking..." : "Check Availability"}
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="play">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="play">Play</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="play" className="mt-2">
              <div className="flex flex-col items-center">
                {/* 🔽 Wrapped MysteryBall in a scaled-down div */}
                <div className="scale-90 sm:scale-75">
                  <MysteryBall 
                    studentId={studentId} 
                    schoolId={schoolId} 
                    coins={coins} 
                    schoolPokemons={schoolPokemons} 
                    onPokemonWon={onPokemonWon} 
                    onCoinsWon={onCoinsWon} 
                    dailyAttemptUsed={dailyAttemptUsed} 
                    setDailyAttemptUsed={setDailyAttemptUsed}
                  />
                </div>

                {!isMobile && (
                  <div className="w-full mt-8 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-medium mb-3 text-center">Open Multiple Balls</h3>
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-full flex items-center gap-4">
                        <span className="text-sm font-medium">Count:</span>
                        <Slider
                          value={[multipleCount]}
                          min={1}
                          max={getMaxPossibleOpens()}
                          step={1}
                          onValueChange={(value) => setMultipleCount(value[0])}
                          className="flex-1"
                          disabled={isProcessing}
                        />
                        <span className="text-sm font-medium w-6 text-center">{multipleCount}</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Cost: {multipleCount > 0 && !dailyAttemptUsed ? (multipleCount - 1) * 2 : multipleCount * 2} coins
                      </p>
                      <Button 
                        onClick={handleOpenMultiple} 
                        disabled={isProcessing || (coins < 2 && dailyAttemptUsed)} 
                        className="w-full"
                      >
                        {isProcessing ? "Opening..." : `Open ${multipleCount} Balls`}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-6 text-center">
                  <p className="mb-2 text-sm font-medium">Mystery ball contains:</p>
                  <div className="flex flex-wrap justify-center gap-3 mt-3">
                    <div className="flex items-center gap-1 bg-purple-100 rounded-full px-3 py-1">
                      <Dice6 className="h-4 w-4 text-purple-500" />
                      <span className="text-xs">Random Pokémon</span>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-100 rounded-full px-3 py-1">
                      <Package className="h-4 w-4 text-amber-500" />
                      <span className="text-xs">Bonus Coins (1-5)</span>
                    </div>
                    <div className="flex items-center gap-1 bg-red-100 rounded-full px-3 py-1">
                      <X className="h-4 w-4 text-red-500" />
                      <span className="text-xs">Nothing Found!</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-2">
              <MysteryBallHistory studentId={studentId} />
            </TabsContent>
          </Tabs>
        )}

        {/* Result Modal for multiple opens */}
        <MysteryBallResult
          isOpen={showResult}
          onClose={handleCloseResult}
          result={currentResult || { type: "nothing" }}
          pokemon={wonPokemon}
          coins={wonCoins}
        />
      </CardContent>
    </Card>
  );
};

export default MysteryBallTab;
