export const readSDMTokenTotalSupplyScript = `
import SdmToken from 0xProfile
pub fun main(): UFix64 {
  return SdmToken.totalSupply
}
`;

export const getIDsofWalletsDcNFTs = `
import DarkCountry from 0xProfile

pub fun main(address: Address): [UInt64] {
  let account = getAccount(address)

  let collectionRef = account.getCapability(DarkCountry.CollectionPublicPath)!.borrow<&{DarkCountry.DarkCountryCollectionPublic}>()
      ?? panic("Could not borrow capability from public collection")

  return collectionRef.getIDs()
}
`;

export const getDcNFTbyID = `
import DarkCountry from 0xProfile
import NonFungibleToken from 0x1d7e57aa55817448

pub fun main(address: Address, itemId: UInt64): &DarkCountry.NFT? {
  let account = getAccount(address)

  let collectionRef = account.getCapability(DarkCountry.CollectionPublicPath)!.borrow<&{DarkCountry.DarkCountryCollectionPublic}>()
      ?? panic("Could not borrow capability from public collection")

  return collectionRef.borrowDarkCountryNFT(id: itemId)
}
`;

export const getAllItemTemplates = `
import DarkCountry from 0xProfile

pub fun main(): [DarkCountry.ItemTemplate] {
  return DarkCountry.getAllItemTemplates()
}
`;

export const sendPackToUnpack = `
import NonFungibleToken from 0x1d7e57aa55817448
import DarkCountry from 0xProfile

// This transaction transfers a NFT from one account to another.

transaction(recipient: Address, withdrawID: UInt64) {
    prepare(signer: AuthAccount) {

        // get the recipients public account object
        let recipient = getAccount(recipient)

        // borrow a reference to the signer's NFT collection
        let collectionRef = signer.borrow<&DarkCountry.Collection>(from: DarkCountry.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the owner's collection")

        // borrow a public reference to the receivers collection
        let depositRef = recipient.getCapability(DarkCountry.CollectionPublicPath)!.borrow<&{DarkCountry.DarkCountryCollectionPublic}>()!

        // withdraw the NFT from the owner's collection
        let nft <- collectionRef.withdraw(withdrawID: withdrawID)

        // Deposit the NFT in the recipient's collection
        depositRef.deposit(token: <-nft)
    }
}
`;

export const fetchSsdmBalance = `
import FungibleToken from 0xf233dcee88fe0abe
import SdmToken from 0xProfile

pub fun main(address: Address): UFix64 {
  let account = getAccount(address)

  let vaultRef = account
    .getCapability(/public/sdmTokenBalance)
    .borrow<&SdmToken.Vault{FungibleToken.Balance}>()
    ?? panic("Could not borrow Balance capability")

  return vaultRef.balance
}
`

export const setUpDcCollection = `
import NonFungibleToken from 0x1d7e57aa55817448 
import DarkCountry from 0xc8c340cebd11f690 
import DarkCountryMarket from 0xc8c340cebd11f690 
import SdmToken from 0xc8c340cebd11f690
import FungibleToken from 0xf233dcee88fe0abe

transaction {
    prepare(signer: AuthAccount) {
        // if the account doesn''t already have a collection
        if signer.borrow<&DarkCountry.Collection>(from: DarkCountry.CollectionStoragePath) == nil {

            // create a new empty collection
            let collection <- DarkCountry.createEmptyCollection()

            // save it to the account
            signer.save(<-collection, to: DarkCountry.CollectionStoragePath)

            // create a public capability for the collection
            signer.link<&DarkCountry.Collection{NonFungibleToken.CollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, DarkCountry.DarkCountryCollectionPublic}>(DarkCountry.CollectionPublicPath, target: DarkCountry.CollectionStoragePath)
        }
        
        // if the account doesn''t already have a collection
        if signer.borrow<&DarkCountryMarket.Collection>(from: DarkCountryMarket.CollectionStoragePath) == nil {

            // create a new empty collection
            let collection <- DarkCountryMarket.createEmptyCollection() as! @DarkCountryMarket.Collection

            // save it to the account
            signer.save(<-collection, to: DarkCountryMarket.CollectionStoragePath)

            // create a public capability for the collection
            signer.link<&DarkCountryMarket.Collection{DarkCountryMarket.CollectionPublic}>(DarkCountryMarket.CollectionPublicPath, target: DarkCountryMarket.CollectionStoragePath)
        }
      
        // It''s OK if the account already has a Vault, but we don''t want to replace it
        if (signer.borrow<&SdmToken.Vault>(from: /storage/sdmTokenVault) == nil) {
            // Create a new SdmToken Vault and put it in storage
            signer.save(<-SdmToken.createEmptyVault(), to: /storage/sdmTokenVault)
        
            // Create a public capability to the Vault that only exposes
            // the deposit function through the Receiver interface
            signer.link<&SdmToken.Vault{FungibleToken.Receiver}>(
              /public/sdmTokenReceiver,
              target: /storage/sdmTokenVault
            )
        
            // Create a public capability to the Vault that only exposes
            // the balance field through the Balance interface
            signer.link<&SdmToken.Vault{FungibleToken.Balance}>(
              /public/sdmTokenBalance,
              target: /storage/sdmTokenVault
            )  
        }
        
    }
}
`

export const transferSDMToWallet = `
import FungibleToken from 0xf233dcee88fe0abe
    import SdmToken from 0xc8c340cebd11f690
    
    transaction(amount: UFix64, to: Address) {
    
        // The Vault resource that holds the tokens that are being transferred
        let sentVault: @FungibleToken.Vault
    
        prepare(signer: AuthAccount) {
    
            // Get a reference to the signer''s stored vault
            let vaultRef = signer.borrow<&SdmToken.Vault>(from: /storage/sdmTokenVault)
                ?? panic("Could not borrow reference to the owner''s Vault!")
    
            // Withdraw tokens from the signer''s stored vault
            self.sentVault <- vaultRef.withdraw(amount: amount)
        }
    
        execute {
    
            // Get the recipient''s public account object
            let recipient = getAccount(to)
    
            // Get a reference to the recipient''s Receiver
            let receiverRef = recipient.getCapability(/public/sdmTokenReceiver)
                .borrow<&{FungibleToken.Receiver}>()
                ?? panic("Could not borrow receiver reference to the recipient''s Vault")
    
            // Deposit the withdrawn tokens in the recipient''s receiver
            receiverRef.deposit(from: <-self.sentVault)
        }
    }
`

export const transferSDMToWalletWithBurn = `
import FungibleToken from 0xf233dcee88fe0abe
    import SdmToken from 0xc8c340cebd11f690
    
    transaction(amount: UFix64, to: Address, burnAmount: UFix64) {
    
        // The Vault resource that holds the tokens that are being transferred
        let sentVault: @FungibleToken.Vault
        let sentVaultBurn: @FungibleToken.Vault
    
        prepare(signer: AuthAccount) {
    
            // Get a reference to the signer''s stored vault
            let vaultRef = signer.borrow<&SdmToken.Vault>(from: /storage/sdmTokenVault)
                ?? panic("Could not borrow reference to the owner''s Vault!")
    
            // Withdraw tokens from the signer''s stored vault
            self.sentVault <- vaultRef.withdraw(amount: amount)

            self.sentVaultBurn <- vaultRef.withdraw(amount: burnAmount)
        }
    
        execute {
    
            // Get the recipient''s public account object
            let recipient = getAccount(to)
            // let recipient2 = getAccount(0xc8c340cebd11f690)
    
            // Get a reference to the recipient''s Receiver
            let receiverRef = recipient.getCapability(/public/sdmTokenReceiver)
                .borrow<&{FungibleToken.Receiver}>()
                ?? panic("Could not borrow receiver reference to the recipient''s Vault")
                
            // let receiverRef2 = recipient2.getCapability(/public/sdmTokenReceiver)
            //     .borrow<&{FungibleToken.Receiver}>()
            //     ?? panic("Could not borrow receiver reference to the recipient''s Vault")

            // Deposit the withdrawn tokens in the recipient''s receiver
            receiverRef.deposit(from: <-self.sentVault)
            
            // receiverRef2.deposit(from: <-self.sentVaultBurn)
            
            emit SdmToken.TokensBurned(amount: burnAmount)
            destroy self.sentVaultBurn
        }
    }
`
