(namespace 'free)
(module kadet-gas-station-2 GOVERNANCE
  (defcap GOVERNANCE ()
    "makes sure only kadet-keyset can update the smart contract"
    (enforce-guard (keyset-ref-guard 'kadet-keyset))
  )

  (implements gas-payer-v1)
  (use coin)

  (defschema gas
    balance:decimal
    guard:guard)

  (deftable ledger:{gas})

  (defcap GAS_PAYER:bool
    ( user:string
      limit:integer
      price:decimal
    )
    (enforce (= "exec" (at "tx-type" (read-msg))) "Inside an exec")
    (enforce (= 1 (length (at "exec-code" (read-msg)))) "Tx of only one pact function")
    (enforce (= "(coin.create-account" (take 20 (at 0 (at "exec-code" (read-msg))))) "only coin.create-account smart contract")
    (compose-capability (ALLOW_GAS))
  )

  (defcap ALLOW_GAS () true)

  (defun create-gas-payer-guard:guard ()
    (create-user-guard (gas-payer-guard))
  )

  (defun gas-payer-guard ()
    (require-capability (GAS))
    (require-capability (ALLOW_GAS))
  )
)
